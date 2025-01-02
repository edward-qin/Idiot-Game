const wordset_file = "https://raw.githubusercontent.com/edward-qin/Idiot-Game/refs/heads/main/words/words_filtered.txt"

export async function loadWordDataset() {
  const wordSet = await fetchWordsSet(wordset_file);
  console.log(wordSet);
  return wordSet;
}

async function fetchWordsSet(fileUrl) {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const text = await response.text();
    const wordsSet = new Set(text.split('\n'));

    return wordsSet;
  } catch (error) {
    console.error('There was an error fetching the file:', error);
  }
}
