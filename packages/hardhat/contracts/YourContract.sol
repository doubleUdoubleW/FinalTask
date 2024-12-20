// packages/hardhat/contracts/NotesContract.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract NotesContract {
    struct Note {
        uint id;
        string content;
    }

    mapping(address => Note[]) private userNotes;
    uint private noteCounter;

    // Event to notify frontend
    event NoteAdded(address indexed user, uint id, string content);
    event NoteUpdated(address indexed user, uint id, string content);
    event NoteDeleted(address indexed user, uint id);

    // Add a new note
    function addNote(string memory _content) public {
        noteCounter++;
        userNotes[msg.sender].push(Note(noteCounter, _content));
        emit NoteAdded(msg.sender, noteCounter, _content);
    }

    // Edit an existing note
    function editNote(uint _id, string memory _newContent) public {
        Note[] storage notes = userNotes[msg.sender];
        for (uint i = 0; i < notes.length; i++) {
            if (notes[i].id == _id) {
                notes[i].content = _newContent;
                emit NoteUpdated(msg.sender, _id, _newContent);
                return;
            }
        }
        revert("Note not found");
    }

    // Delete a note
    function deleteNote(uint _id) public {
        Note[] storage notes = userNotes[msg.sender];
        for (uint i = 0; i < notes.length; i++) {
            if (notes[i].id == _id) {
                notes[i] = notes[notes.length - 1]; // Replace with last note
                notes.pop(); // Remove the last element
                emit NoteDeleted(msg.sender, _id);
                return;
            }
        }
        revert("Note not found");
    }

    // Get all notes of the user
    function getNotes() public view returns (Note[] memory) {
        return userNotes[msg.sender];
    }
}
