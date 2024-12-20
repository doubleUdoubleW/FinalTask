import { expect } from "chai";
import { ethers } from "hardhat";

describe("NotesContract", function () {
  let notesContract: any;
  let user1: any;
  let user2: any;

  before(async () => {
    [user1, user2] = await ethers.getSigners();

    const NotesContractFactory = await ethers.getContractFactory("NotesContract");
    notesContract = await NotesContractFactory.deploy();
  });

  describe("Add Note", function () {
    it("Должен добавлять новую заметку для пользователя", async function () {
      const content = "My first note";

      await notesContract.connect(user1).addNote(content);

      const notes = await notesContract.connect(user1).getNotes();
      expect(notes.length).to.equal(1);
      expect(notes[0].content).to.equal(content);
    });
  });

  describe("Edit Note", function () {
    it("Должен изменять существующую заметку", async function () {
      const updatedContent = "Updated note content";

      await notesContract.connect(user1).editNote(1, updatedContent);

      const notes = await notesContract.connect(user1).getNotes();
      expect(notes[0].content).to.equal(updatedContent);
    });

    it("Должен отклонять изменение несуществующей заметки", async function () {
      await expect(
        notesContract.connect(user1).editNote(999, "Nonexistent note")
      ).to.be.revertedWith("Note not found");
    });
  });

  describe("Delete Note", function () {
    it("Должен удалять существующую заметку", async function () {
      await notesContract.connect(user1).deleteNote(1);

      const notes = await notesContract.connect(user1).getNotes();
      expect(notes.length).to.equal(0);
    });

    it("Должен отклонять удаление несуществующей заметки", async function () {
      await expect(notesContract.connect(user1).deleteNote(999)).to.be.revertedWith("Note not found");
    });
  });

  describe("User Separation", function () {
    it("Должен поддерживать отдельные заметки для разных пользователей", async function () {
      await notesContract.connect(user2).addNote("User2's note");

      const user1Notes = await notesContract.connect(user1).getNotes();
      const user2Notes = await notesContract.connect(user2).getNotes();

      expect(user1Notes.length).to.equal(0); // У user1 нет заметок после удаления
      expect(user2Notes.length).to.equal(1); // У user2 есть одна заметка
      expect(user2Notes[0].content).to.equal("User2's note");
    });
  });
});
