const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🔐 JWT Secret Setup');
console.log('==================');

// Generate a secure JWT secret
const jwtSecret = crypto.randomBytes(64).toString('hex');

console.log('\n✅ Generated secure JWT secret:');
console.log(jwtSecret);

console.log('\n📝 To use this secret, add it to your environment variables:');
console.log('JWT_SECRET=' + jwtSecret);

console.log('\n🔧 For development, you can create a .env file in the server directory with:');
console.log('JWT_SECRET=' + jwtSecret);
console.log('DB_URI=mongodb://localhost:27017/ddv5');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('\n⚠️  .env file already exists. Please manually add:');
  console.log('JWT_SECRET=' + jwtSecret);
} else {
  console.log('\n💡 Would you like to create a .env file? (y/n)');
  // Note: In a real implementation, you'd want to prompt for user input
  // For now, just show the instructions
  console.log('To create .env file, run:');
  console.log(`echo "JWT_SECRET=${jwtSecret}" > .env`);
  console.log('echo "DB_URI=mongodb://localhost:27017/ddv5" >> .env');
}

console.log('\n🚀 After setting the JWT_SECRET, restart your server for the changes to take effect.');
console.log('\n💡 This will prevent users from being logged out when the server restarts.'); 