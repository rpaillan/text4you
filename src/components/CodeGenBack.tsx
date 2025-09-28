import { useEffect, useRef } from 'react';
import './CodeGenBack.scss';

export const CodeGenBack = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      // let fill all the div with random number, my idea is that you can copy any part of the string to be used as a password.
      // 1. let compute how many characters we need to fill the div
      const w = ref.current.clientWidth;
      const h = ref.current.clientHeight;
      // compute the character size based on measuring renderered size when using one char.

      const charSizeWidth = 10 * 10;
      const charSizeHeight = 10;
      const charactersWidth = w / charSizeWidth;
      const charactersHeight = h / charSizeHeight;
      const characters = charactersWidth * charactersHeight;
      // 2. let fill the div with random characters
      // for a good password we need to include some numbers and special characters.
      const specialCharacters = '!@#$%^&*()_+-=[]{}|;:,.?';
      // Dark color palette for highlights
      const darkColors = [
        '#2d3748', // dark blue-gray
        '#1a202c', // almost black
        '#4a5568', // dark gray
        '#2c5282', // deep blue
        '#2f855a', // deep green
        '#805ad5', // deep purple
        '#c53030', // dark red
        '#b7791f', // dark gold
        '#2c7a7b', // teal
      ];

      const highlightMaxLength = 8;
      const passwords = [];
      for (let i = 0; i < characters; i++) {
        let password = Math.random().toString(36).substring(2, 12).toLowerCase().split('');
        const unusedIndexes = password.map((_, index) => index);

        unusedIndexes.sort(() => Math.random() - 0.5);

        for (let i = 0; i < 2; i++) {
          const symbolIndex = unusedIndexes.shift()!;
          password.splice(symbolIndex, 1, specialCharacters[Math.floor(Math.random() * specialCharacters.length)]);
        }

        unusedIndexes.sort(() => Math.random() - 0.5);

        const letterIndexes = unusedIndexes.filter(index => {
          return password[index].match(/[a-z]/);
        });
        if (letterIndexes.length >= 2) {
          for (let i = 0; i < 2; i++) {
            const letterIndex = letterIndexes.shift()!;
            password[letterIndex] = password[letterIndex].toUpperCase();
          }
        }

        // highlight a random character
        let highlightProb = Math.random();
        if (highlightProb > 0.45 && highlightProb < 0.5) {
          const charLenght = Math.floor(Math.random() * highlightMaxLength) + 1;
          const highlightProbIndex = Math.floor(Math.random() * (password.length - charLenght));
          const format = Math.random() > 0.5 ? 'color' : 'background-color';

          const color = darkColors[Math.floor(Math.random() * darkColors.length)];
          if (format === 'color') {
            for (let i = 0; i < charLenght; i++) {
              password[highlightProbIndex + i] =
                `<span class="code-gen-back-char" style="color: ${color};">${password[highlightProbIndex + i]}</span>`;
            }
          } else {
            for (let i = 0; i < charLenght; i++) {
              password[highlightProbIndex + i] =
                `<span class="code-gen-back-char" style="background-color: ${color};">${password[highlightProbIndex + i]}</span>`;
            }
          }
        }

        passwords.push(password.join(''));
      }

      ref.current.innerHTML = passwords.join('');
    }
  }, []);

  return <div ref={ref} className="code-gen-back"></div>;
};
