// Test script for the chat API
const BASE_URL = 'http://localhost:8080';

async function testAPI() {
  try {
    console.log('=== Testing Chat API ===\n');

    // Step 1: Create a new chat session
    console.log('Step 1: Creating new chat session...');
    const startResponse = await fetch(`${BASE_URL}/api/chat/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!startResponse.ok) {
      console.error('Failed to start chat:', startResponse.status);
      const err = await startResponse.text();
      console.error(err);
      return;
    }

    const { userId, threadId } = await startResponse.json();
    console.log(`✓ Session created. UserId: ${userId}, ThreadId: ${threadId}\n`);

    // Step 2: Send a test message
    console.log('Step 2: Sending test message...');
    const chatResponse = await fetch(`${BASE_URL}/api/chat/text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        threadId,
        message: 'Hello! Can you help me with a legal question about contract law?'
      }),
    });

    if (!chatResponse.ok) {
      console.error('Failed to send message:', chatResponse.status);
      const err = await chatResponse.text();
      console.error('Error response:', err);
      return;
    }

    const { response } = await chatResponse.json();
    console.log(`✓ Got response from assistant:\n${response}\n`);

    console.log('=== Test Complete ===');
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

testAPI();
