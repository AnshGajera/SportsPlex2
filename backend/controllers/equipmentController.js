const Equipment = require('../models/equipment');

// Get all equipment
exports.getAllEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find();
    res.json(equipment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch equipment.' });
  }
};

// Add new equipment (admin only)
exports.addEquipment = async (req, res) => {
  try {
    const { name, category, quantity, description, condition, location } = req.body;
    let imagePath = '';
    if (req.file) {
      imagePath = `/uploads/equipment/${req.file.filename}`;
    } else if (req.body.image && typeof req.body.image === 'string') {
      imagePath = req.body.image;
    } else {
      imagePath = '';
    }
    const newEquipment = new Equipment({
      name,
      category,
      quantity: Number(quantity),
      description,
      condition,
      location,
      image: imagePath,
      createdBy: req.user._id
    });
    await newEquipment.save();
    res.status(201).json(newEquipment);
  } catch (err) {
    console.error('Add Equipment Error:', err);
    res.status(500).json({ error: 'Failed to add equipment.', details: err.message });
  }
};

// Update equipment (admin only)
exports.updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('--- UPDATE EQUIPMENT DEBUG ---');
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);
    const existing = await Equipment.findById(id);
    if (!existing) {
      console.log('Equipment not found');
      return res.status(404).json({ error: 'Equipment not found.' });
    }
    let updates = req.body ? { ...req.body } : {};
    // Handle image update
    if (req.file) {
      console.log('New image uploaded:', req.file.filename);
      updates.image = `/uploads/equipment/${req.file.filename}`;
    } else if (req.body && typeof req.body.image === 'string') {
      console.log('Image from body:', req.body.image);
      updates.image = req.body.image;
    } else if (!req.file && (!req.body || typeof req.body.image === 'undefined')) {
      console.log('Keeping existing image:', existing.image);
      updates.image = existing.image;
    }
    // If image is empty string, remove image
    if (req.body && req.body.image === '') {
      console.log('Removing image');
      updates.image = '';
    }
    console.log('Final updates:', updates);
    const equipment = await Equipment.findByIdAndUpdate(id, updates, { new: true });
    console.log('Updated equipment:', equipment);
    console.log('--- END UPDATE DEBUG ---');
    res.json(equipment);
  } catch (err) {
    console.error('Update Equipment Error:', err);
    res.status(500).json({ error: 'Failed to update equipment.', details: err.message });
  }
};

// Delete equipment (admin only)
exports.deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = await Equipment.findByIdAndDelete(id);
    if (!equipment) return res.status(404).json({ error: 'Equipment not found.' });
    res.json({ message: 'Equipment deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete equipment.' });
  }
};
