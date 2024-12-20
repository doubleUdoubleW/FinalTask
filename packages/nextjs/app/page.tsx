'use client';

import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";  // Обновленный импорт для версии ethers 6.x
import NotesContract from '/contracts/NotesContract.json';

const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

export default function Home() {
  const { address } = useAccount(); // Получаем адрес аккаунта
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [editNoteId, setEditNoteId] = useState<number | null>(null);
  const [editNoteContent, setEditNoteContent] = useState("");
  const [contractAbi, setContractAbi] = useState<any>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null); // Инициализируем переменную для контракта

  // Загружаем ABI контракта
  useEffect(() => {
    const fetchContractAbi = async () => {
      try {
        const response = await fetch("/contracts/NotesContract.json");
        const data = await response.json();
        setContractAbi(data.abi);
      } catch (error) {
        console.error("Ошибка при загрузке ABI контракта:", error);
      }
    };

    fetchContractAbi();
  }, []);

  // Создаем контракт с использованием ethers.js после загрузки ABI
  useEffect(() => {
    if (contractAbi) {
      const provider = new ethers.JsonRpcProvider(); // Используем новый JsonRpcProvider
      const newContract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi, provider);
      setContract(newContract); // Устанавливаем contract в состояние
    }
  }, [contractAbi]);

  // Загружаем заметки после того, как contract будет инициализирован
  useEffect(() => {
    const fetchNotes = async () => {
      if (!contract) return; // Если contract еще не загружен, выходим
      try {
        const fetchedNotes = await contract.getNotes();
        setNotes(fetchedNotes.map((note: any) => ({ id: note.id.toNumber(), content: note.content })));
      } catch (error) {
        console.error("Ошибка при получении заметок:", error);
      }
    };

    fetchNotes();
  }, [contract]); // Теперь зависит от contract

  const handleAddNote = async () => {
    if (!newNote || !contract) return;
    try {
      const tx = await contract.addNote(newNote);
      await tx.wait();
      setNewNote("");
      fetchNotes();
    } catch (error) {
      console.error("Ошибка при добавлении заметки:", error);
    }
  };

  const handleEditNote = async () => {
    if (!editNoteId || !editNoteContent || !contract) return;
    try {
      const tx = await contract.editNote(editNoteId, editNoteContent);
      await tx.wait();
      setEditNoteId(null);
      setEditNoteContent("");
      fetchNotes();
    } catch (error) {
      console.error("Ошибка при редактировании заметки:", error);
    }
  };

  const handleDeleteNote = async (id: number) => {
    if (!contract) return;
    try {
      const tx = await contract.deleteNote(id);
      await tx.wait();
      fetchNotes();
    } catch (error) {
      console.error("Ошибка при удалении заметки:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Notes Application</h1>
      <div>
        <h2>Add Note</h2>
        <input
          type="text"
          placeholder="Enter note content"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
        />
        <button onClick={handleAddNote}>Add Note</button>
      </div>
      <div>
        <h2>Notes</h2>
        {notes.map((note) => (
          <div key={note.id} style={{ marginBottom: "10px" }}>
            <p>
              <strong>Note {note.id}:</strong> {note.content}
            </p>
            {editNoteId === note.id ? (
              <div>
                <input
                  type="text"
                  value={editNoteContent}
                  onChange={(e) => setEditNoteContent(e.target.value)}
                />
                <button onClick={handleEditNote}>Save</button>
                <button onClick={() => setEditNoteId(null)}>Cancel</button>
              </div>
            ) : (
              <div>
                <button onClick={() => {
                  setEditNoteId(note.id);
                  setEditNoteContent(note.content);
                }}>
                  Edit
                </button>
                <button onClick={() => handleDeleteNote(note.id)}>Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
