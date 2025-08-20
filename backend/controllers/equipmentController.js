const Equipment = require('../models/equipment');

// Get all equipment
exports.getAllEquipment = async (req, res) => {
  try {
    // Check if user is admin by looking at the user object from middleware
    const isUserAdmin = req.user && req.user.role === 'admin';
    
    // If admin, show all equipment; if regular user, show only active equipment
    const query = isUserAdmin ? {} : { isActive: true };
    
    const equipment = await Equipment.find(query);
    res.json(equipment);
  } catch (err) {
    console.error('Get equipment error:', err);
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
      availableQuantity: Number(quantity), // Initially all quantity is available
      allocatedQuantity: 0,
      reservedQuantity: 0,
      description,
      condition,
      location,
      image: imagePath,
      createdBy: req.user._id,
      isActive: true
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
    
    // Handle quantity updates and recalculate availability
    if (updates.quantity) {
      const newQuantity = Number(updates.quantity);
      const quantityDifference = newQuantity - existing.quantity;
      
      updates.quantity = newQuantity;
      // Adjust available quantity proportionally
      updates.availableQuantity = Math.max(0, 
        (existing.availableQuantity || 0) + quantityDifference
      );
    }
    
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
    
    // Instead of deleting, mark as inactive if there are active allocations
    const Equipment = require('../models/equipment');
    const EquipmentAllocation = require('../models/equipmentAllocation');
    
    const activeAllocations = await EquipmentAllocation.countDocuments({
      equipment: id,
      status: { $in: ['allocated', 'overdue'] }
    });
    
    if (activeAllocations > 0) {
      // Mark as inactive instead of deleting
      const equipment = await Equipment.findByIdAndUpdate(
        id, 
        { isActive: false }, 
        { new: true }
      );
      if (!equipment) return res.status(404).json({ error: 'Equipment not found.' });
      
      res.json({ 
        message: 'Equipment marked as inactive due to active allocations.',
        equipment 
      });
    } else {
      // Safe to delete if no active allocations
      const equipment = await Equipment.findByIdAndDelete(id);
      if (!equipment) return res.status(404).json({ error: 'Equipment not found.' });
      
      res.json({ message: 'Equipment deleted successfully.' });
    }
  } catch (err) {
    console.error('Delete Equipment Error:', err);
    res.status(500).json({ error: 'Failed to delete equipment.' });
  }
};
