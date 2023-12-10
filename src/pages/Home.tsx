import React, { useState, useEffect } from 'react';
import { User, getAuth, signOut } from 'firebase/auth';

import {
  getDatabase,
  ref as DBref,
  onValue,
  update,
  push,
  Database,
} from 'firebase/database';

import {
  ref as StorageRef,
  uploadBytesResumable,
  getDownloadURL,
  getStorage,
  listAll,
} from 'firebase/storage';

import { Reference } from '@firebase/storage-types';

interface Hand {
  url: string;
  createdAt: number;
  key: string;
}

const Home: React.FC<{ user: User }> = ({ user }) => {

  const auth = getAuth();
  const db: Database = getDatabase();
  const [reload, setReload] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [percent, setPercent] = useState<number>(0);
  const [hands, setHands] = useState<Hand[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const storage = getStorage();

  // Handles input change event and updates state
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    } else {
      setFile(null); // Set to null if no file is selected
    }
  }

  function handleUpload() {
    if (!file) {
      alert('Please choose a file first!');
    } else {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Set the desired width and height (e.g., 100px x 100px)
          const width = 100;
          const height = 100;

          canvas.width = width;
          canvas.height = height;

          // Draw the image onto the canvas with the desired size
          ctx?.drawImage(img, 0, 0, width, height);

          // Convert the canvas content to a Blob
          canvas.toBlob((blob) => {
            if (blob) {
              // Create a reference to the storage path
              const storageRef = StorageRef(storage, `/files/${file.name}`);
          
              // Upload the resized image
              const uploadTask = uploadBytesResumable(storageRef, blob);
          
              uploadTask.on(
                'state_changed',
                (snapshot) => {
                  const percent = Math.round(
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                  );
          
                  // Update progress
                  setPercent(percent);
                },
                (err) => console.log(err),
                () => {
                  // Get the download URL
                  getDownloadURL(uploadTask.snapshot.ref)
                    .then((url) => {
                      // Save the download URL to the database
                      const newRef = push(DBref(db, 'users/' + user.uid + '/hands'), {
                        url: url,
                        createdAt: Date.now(),
                      });
          
                      // Clear the file input and reset percent
                      setFile(null);
                      setPercent(0);
                    })
                    .catch((error) =>
                      console.error('Error getting download URL:', error)
                    );
                }
              );
            } else {
              console.error('Blob is null');
            }
          });
          
        };
      };
    }
  }

  useEffect(() => {
    const globalRef = DBref(db, 'users/' + user.uid + '/hands');
    onValue(globalRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        let posts: Hand[] = [];
        let keys = Object.keys(data);
        for (let i = 0; i < keys.length; i++) {
          let newPost: Hand = {
            url: data[keys[i]].url,
            createdAt: data[keys[i]].createdAt,
            key: keys[i],
          };
          posts.push(newPost);
        }
        console.log(hands);
        setHands(posts.reverse());
      }
      setLoading(false);
    });
  }, [storage]);

  return (
    <>
      <header>
        <input style={{ margin: '1rem', padding: '0.40rem' }} type="file" onChange={handleChange} accept="" />
        <button style={{ marginRight: '1rem' }} onClick={handleUpload}>
          Upload your hand
        </button>
        <span className="percent">{percent}% done</span>
      </header>
      <div className="hands-container">
        {hands.map((item, index) => (
          <div key={index}>
            <a href={item.url}>
              <img src={item.url} alt={`Hand ${index + 1}`} />
            </a>
          </div>
        ))}
      </div>
      <button onClick={() => signOut(auth)}>Sign out</button>
    </>
  );
};

export default Home;
