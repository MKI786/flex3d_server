const Client = require('../Models/Client');
const Customizer = require('../Models/Customizer');
const Model = require('../Models/Model');
const Orders = require('../Models/Orders');

const register = async (req, res) => {

  try {
    const { name, whatsapp, customizerId } = req.body;

    const existingClient = await Client.findOne({ whatsapp });
    if (existingClient) {
      return res.status(404).json({ message: 'Client already exists with this WhatsApp number.' });
    }
    const newClient = new Client({
      name: name,
      whatsapp: whatsapp,
      customizer: customizerId ? [customizerId] : []
    });

    await newClient.save();

    res.status(201).json({ message: 'Client order saved successfully', client: newClient });
  } catch (err) {
    console.error('Error saving client:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}



const fetchorders = async (req, res) => {

  const orders = await Client.find()
    .populate({
      path: 'customizer',
      populate: {
        path: 'Model',
      }
    })
    .sort({ createdAt: 1 });


  if (orders) {
    res.status(200).json(orders);
    console.log("order fetched successfuly ok ")
  }
  else {
    res.status(500).json({ error: "server error" });
  }
}



const assigncustomizer = async (req, res) => {
  const { url, status, cwhatsapp } = req.body;

  try {

    const assigncus = new Customizer({
      CURL: url,
      subscription: status
    });

    const savedCustomizer = await assigncus.save();

    await Client.updateOne(
      { whatsapp: cwhatsapp, customizer: { $exists: false } },
      { $set: { customizer: [] } }
    );

    const updatedClient = await Client.findOneAndUpdate(
      { whatsapp: cwhatsapp },
      { $push: { customizer: savedCustomizer._id } },
      { new: true }
    ).populate('customizer');

    if (!updatedClient) {
      return res.status(404).json({ message: 'Client not found with this WhatsApp number' });
    }


    res.status(200).json(updatedClient);
  } catch (error) {
    console.error('Assignment error:', error);
    res.status(500).json({ message: 'Something went wrong', error });
  }
};


const deleteclient = async (req, res) => {

  const { delwhatsapp } = req.body;

  const delclient = await Client.deleteOne({ whatsapp: delwhatsapp });
  if (delclient) {
    res.status(200).json({ message: "client deleted succesfuly" });
  }
  else {
    res.status(401).json({ message: "client Not deleted succesfuly" });
  }
}


const handlestatusaction = async (req, res) => {

  const { statusvalue, cid } = req.body;

  if (statusvalue === "Deleted") {
    const delcustomizer = await Customizer.findByIdAndDelete(cid);
    if (delcustomizer) {
      return res.status(200).json({ message: "deleted" });
    }
    else {
      return res.status(200).json({ message: "Customizer has Not been deleted sucessfuly" });
    }
  }


  const updatecustomizer = await Customizer.findByIdAndUpdate(cid, { subscription: statusvalue }, { new: true });

  if (updatecustomizer) {
    res.status(200).json(updatecustomizer);
  }
  else {
    res.status(401).json({ message: "Subscription has NOT been updated sucessfuly" });
  }
}


const authenticatecustomizer = async (req, res) => {
  const { Host_url } = req.body;

  try {
    const customizer = await Customizer.findOne({ CURL: Host_url }).populate("Model");

    if (customizer) {
      if (customizer.subscription === "Active" || customizer.subscription === "Trial") {
        res.status(200).json({ subscription: true, customizer: customizer });
      }
      else {
        res.status(401).json({ subscription: false });
      }
    }
    else {
      console.error("Authentication error:", error);
      res.status(500).json({ subscription: false });
    }

  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ subscription: false });
  }
};



const assignmodel = async (req, res) => {
  try {
    const { modelName, modelUrl, modelThumbnailurl, modelTextureurl, curl } = req.body;

    // Step 1: Create new model
    const newModel = new Model({
      modelName: modelName,
      modelUrl: modelUrl,
      modelThumbnailurl: modelThumbnailurl,
      modelTextureurl: modelTextureurl
    });

    await newModel.save();

    // Step 2: Find customizer by CURL
    const customizer = await Customizer.findOne({ CURL: curl });

    if (!customizer) {
      return res.status(404).json({ message: 'Customizer not found' });
    }

    // Step 3: Add model _id to Customizer.Model array
    customizer.Model.push(newModel._id);
    await customizer.save();

    return res.status(200).json({ message: 'Model assigned successfully', model: newModel });
  } catch (err) {
    console.error('Error in assignmodel:', err.message, err.stack);

    return res.status(500).json({ message: err.message, });
  }
}


const deletemodel = async (req, res) => {
  try {
    const { mid } = req.body;

    const deletedModel = await Model.findByIdAndDelete(mid);

    if (!deletedModel) {
      return res.status(404).json({ message: 'Model not found' });
    }

    await Customizer.updateMany(
      { Model: mid },
      { $pull: { Model: mid } }
    );

    return res.status(200).json({ message: 'Model deleted and removed from Customizers successfully' });
  } catch (err) {
    console.error('Error in deletemodel:', err.message, err.stack);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const deletecustomizer = async (req, res) => {
  try {
    const { cid } = req.body;

    const customizer = await Customizer.findById(cid);

    if (!customizer) {
      return res.status(404).json({ message: 'Customizer not found' });
    }

    await Model.deleteMany({ _id: { $in: customizer.Model } });


    await Customizer.findByIdAndDelete(cid);


    await Client.updateMany(
      { customizer: cid },
      { $pull: { customizer: cid } }
    );

    return res.status(200).json({ message: 'Customizer and associated models deleted successfully' });
  } catch (err) {
    console.error('Error in deletecustomizer:', err.message, err.stack);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


const customerordersubmit = async (req, res) => {
  try {

    const { orderform, activeModel, chost_url } = req.body;
    const { order_name, order_address, order_mobile } = orderform;


    if (!order_name || !order_address || !order_mobile || !chost_url || !activeModel) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const newOrder = new Orders({
      order_name: order_name,
      order_address: order_address,
      order_mobile: order_mobile,
      order_model: activeModel,
    });

    const savedOrder = await newOrder.save();

    const vendorLink = `${chost_url}/order/${savedOrder._id}`;

    return res.status(200).json({
      success: true,
      message: "Order placed successfully",
      vendorLink,
    });
  } catch (error) {
    console.error("Order submit error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


const getorderpreview = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Orders.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Preview error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};




module.exports = {
  register,
  fetchorders,
  assigncustomizer,
  deleteclient,
  handlestatusaction,
  authenticatecustomizer,
  assignmodel,
  deletemodel,
  deletecustomizer,
  customerordersubmit,
  getorderpreview,
};