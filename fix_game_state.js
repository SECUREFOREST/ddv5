const mongoose = require('mongoose');

// Connect to MongoDB (adjust connection string as needed)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/deviantdare';

async function fixGameState() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Import the SwitchGame model
    const SwitchGame = require('./server/models/SwitchGame');
    
    // Find the specific game
    const gameId = '687f93c464fbcde0469ed322';
    const game = await SwitchGame.findById(gameId);
    
    if (!game) {
      console.error('Game not found');
      return;
    }
    
    console.log('Current game state:', {
      id: game._id,
      status: game.status,
      winner: game.winner,
      loser: game.loser,
      creatorMove: game.creatorDare?.move,
      participantMove: game.participantDare?.move
    });
    
    // Fix the game state
    if (game.status === 'awaiting_proof' && game.winner && !game.loser) {
      console.log('Fixing game state...');
      
      // Set the loser based on the winner
      if (game.winner.equals(game.creator)) {
        game.loser = game.participant;
        console.log('Creator won, participant is the loser');
      } else {
        game.loser = game.creator;
        console.log('Participant won, creator is the loser');
      }
      
      // Set moves if they're missing
      if (!game.creatorDare.move) {
        game.creatorDare.move = 'rock';
        console.log('Set creator move to rock');
      }
      if (!game.participantDare.move) {
        game.participantDare.move = 'scissors';
        console.log('Set participant move to scissors');
      }
      
      // Save the fixed game
      await game.save();
      console.log('Game state fixed successfully!');
      
      // Verify the fix
      const fixedGame = await SwitchGame.findById(gameId).populate('creator participant winner loser');
      console.log('Fixed game state:', {
        id: fixedGame._id,
        status: fixedGame.status,
        winner: fixedGame.winner?.fullName || fixedGame.winner?.username,
        loser: fixedGame.loser?.fullName || fixedGame.loser?.username,
        creatorMove: fixedGame.creatorDare?.move,
        participantMove: fixedGame.participantDare?.move
      });
    } else {
      console.log('Game state is already consistent or cannot be fixed');
    }
    
  } catch (error) {
    console.error('Error fixing game state:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the fix
fixGameState(); 