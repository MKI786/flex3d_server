const Client = require('../Models/Client');
const Customizer = require('../Models/Customizer');

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

  const orders = await Client.find().populate('customizer').sort({ createdAt: 1 });

  if (orders) {
    res.status(200).json(orders);
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
    const customizer = await Customizer.findOne({ CURL: Host_url });

    if (customizer.subscription === "Active" || customizer.subscription === "Trial") {
      res.status(200).json({ subscription: true });
    }
    else {
      res.status(401).json({ subscription: false });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ subscription: false });
  }
};


module.exports = { register, fetchorders, assigncustomizer, deleteclient, handlestatusaction, authenticatecustomizer };