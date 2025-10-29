// Simple test script to verify API connection
// Run with: node test-api.js

const API_BASE = 'https://api.greentraver.uz';

async function testApiConnection() {
  console.log('Testing API connection to:', API_BASE);
  
  try {
    // Test without authentication first
    console.log('\n1. Testing API without authentication...');
    const response1 = await fetch(`${API_BASE}/doctors/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Response status:', response1.status);
    
    if (response1.status === 200) {
      console.log('✅ API is accessible and working!');
      const data = await response1.json();
      console.log('Response data:', JSON.stringify(data, null, 2));
      console.log('\n💡 Note: API does not require authentication, so login will work with any credentials');
    } else if (response1.status === 401) {
      console.log('✅ API is accessible and requires authentication (expected)');
      
      // Test with basic auth
      console.log('\n2. Testing with basic authentication...');
      const username = 'admin'; // Change this to your superuser username
      const password = 'admin'; // Change this to your superuser password
      const credentials = Buffer.from(`${username}:${password}`).toString('base64');
      
      const response2 = await fetch(`${API_BASE}/doctors/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`,
        },
      });
      
      console.log('Authenticated response status:', response2.status);
      
      if (response2.ok) {
        const data = await response2.json();
        console.log('✅ Authentication successful!');
        console.log('Response data:', JSON.stringify(data, null, 2));
      } else {
        console.log('❌ Authentication failed with status:', response2.status);
        const errorText = await response2.text();
        console.log('Error response:', errorText);
        console.log('\n💡 Make sure you have a superuser account with username/password:', username, password);
      }
    } else {
      console.log('❌ Unexpected API response status:', response1.status);
    }
  } catch (error) {
    console.log('❌ Failed to connect to API:', error.message);
    console.log('Make sure the API server is running at', API_BASE);
  }
}

testApiConnection();
