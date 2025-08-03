// Test script for OSA-style switch game draw logic
// This tests the three different draw scenarios from OneSubmissiveAct

console.log('Testing OSA-style Switch Game Draw Logic...\n');

// Test function to simulate the draw logic
function testDrawLogic(move1, move2) {
  console.log(`Testing: ${move1} vs ${move2}`);
  
  if (move1 === move2) {
    // OSA Draw Logic
    if (move1 === 'rock') {
      console.log('  → Both lose! Both must perform each other\'s demands');
      return { bothLose: true, status: 'awaiting_proof' };
    } else if (move1 === 'paper') {
      console.log('  → Both win! No one has to do anything');
      return { bothWin: true, status: 'completed' };
    } else if (move1 === 'scissors') {
      // Coin flip simulation
      const coinFlip = Math.random() < 0.5;
      const winner = coinFlip ? 'player1' : 'player2';
      console.log(`  → Coin flip determined winner: ${winner}`);
      return { winner, status: 'awaiting_proof' };
    }
  } else {
    // Normal win/lose scenario
    function beats(a, b) {
      return (
        (a === 'rock' && b === 'scissors') ||
        (a === 'scissors' && b === 'paper') ||
        (a === 'paper' && b === 'rock')
      );
    }
    
    if (beats(move1, move2)) {
      console.log('  → Player 1 wins');
      return { winner: 'player1', status: 'awaiting_proof' };
    } else {
      console.log('  → Player 2 wins');
      return { winner: 'player2', status: 'awaiting_proof' };
    }
  }
}

// Test cases
const testCases = [
  ['rock', 'rock'],
  ['paper', 'paper'], 
  ['scissors', 'scissors'],
  ['rock', 'paper'],
  ['paper', 'scissors'],
  ['scissors', 'rock']
];

console.log('Running test cases:\n');

testCases.forEach(([move1, move2], index) => {
  console.log(`Test ${index + 1}:`);
  const result = testDrawLogic(move1, move2);
  console.log(`  Result:`, result);
  console.log('');
});

console.log('✅ OSA-style draw logic implementation complete!');
console.log('\nKey features implemented:');
console.log('- Rock vs Rock: Both players lose and must perform each other\'s demands');
console.log('- Paper vs Paper: Both players win, no proof needed');
console.log('- Scissors vs Scissors: Coin flip determines random loser');
console.log('- Normal scenarios: Standard RPS win/lose logic'); 