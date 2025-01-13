const wordset_file = "https://raw.githubusercontent.com/edward-qin/Idiot-Game/refs/heads/main/words/words_filtered.txt";
export async function loadWordDataset() {
    const wordSet = await fetchWordsSet(wordset_file);
    return wordSet;
}
async function fetchWordsSet(fileUrl) {
    try {
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const text = await response.text();
        return new Set(text.split("\n"));
    }
    catch (error) {
        console.log("Error fetching file:", fileUrl);
        throw error;
    }
}
