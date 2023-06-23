import { phrases } from "../../services/phrases";
import { useEffect, useState } from "react";

const FIVE_SECONDS = 5000;

export const useRandomPhrase = () => {
  const [phrase, setPhrase] = useState(
    phrases[Math.floor(Math.random() * phrases.length)]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setPhrase(phrases[Math.floor(Math.random() * phrases.length)]);
    }, FIVE_SECONDS);

    return () => clearInterval(interval);
  }, []);

  return phrase;
};
