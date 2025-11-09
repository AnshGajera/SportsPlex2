const mongoose = require('mongoose');
const Equipment = require('./models/equipment');
const fs = require('fs');
const path = require('path');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sportsplex', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function updateEquipmentImages() {
  try {
    console.log('Starting equipment image update...');
    
    // First, let's see ALL equipment in the database
    const allEquipment = await Equipment.find({});
    console.log('=== ALL EQUIPMENT IN DATABASE ===');
    allEquipment.forEach(item => {
      console.log(`${item.name}: image="${item.image}", category="${item.category}"`);
    });
    console.log('================================');
    
    // Get all equipment without images
    const equipmentWithoutImages = await Equipment.find({
      $or: [
        { image: null },
        { image: '' },
        { image: { $exists: false } }
      ]
    });
    
    console.log(`Found ${equipmentWithoutImages.length} equipment items without images`);
    
    // Get list of available image files
    const uploadsPath = path.join(__dirname, 'uploads', 'equipment');
    const availableImages = fs.existsSync(uploadsPath) ? fs.readdirSync(uploadsPath) : [];
    
    console.log(`Available images: ${availableImages.length}`);
    console.log('Image files:', availableImages);
    
    // Define category-specific image mapping
    const categoryImageMapping = {
      'volleyball': ['volleyball', 'volley'],
      'basketball': ['basketball', 'basket'],
      'cricket': ['cricket'],
      'football': ['football', 'soccer'],
      'badminton': ['badminton'],
      'other': ['equipment', 'sport']
    };
    
    let updateCount = 0;
    
    for (let i = 0; i < equipmentWithoutImages.length && i < availableImages.length; i++) {
      const equipment = equipmentWithoutImages[i];
      const imageFile = availableImages[i];
      const imagePath = `/uploads/equipment/${imageFile}`;
      
      try {
        await Equipment.findByIdAndUpdate(equipment._id, { 
          image: imagePath 
        });
        
        console.log(`Updated ${equipment.name} with image: ${imagePath}`);
        updateCount++;
      } catch (error) {
        console.error(`Error updating ${equipment.name}:`, error);
      }
    }
    
    console.log(`Successfully updated ${updateCount} equipment items with images`);
    
    // Verify the updates
    const updatedEquipment = await Equipment.find({});
    console.log('\n=== VERIFICATION ===');
    updatedEquipment.forEach(item => {
      console.log(`${item.name}: ${item.image || 'NO IMAGE'}`);
    });
    
  } catch (error) {
    console.error('Error updating equipment images:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
}

updateEquipmentImages();