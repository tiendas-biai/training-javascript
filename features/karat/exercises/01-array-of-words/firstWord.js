// TODO: Implement `firstWord(words, note)`.
//
// Given an array of `words` and a string `note`, return the FIRST word
// (in array order) that can be spelled using only the letters available in
// `note`. Each letter in `note` may be used at most as many times as it
// appears there. If no word qualifies, return '-'.
//
//   firstWord(['baby', 'cat'], 'act')   => 'cat'
//   firstWord(['baby', 'cat'], 'tab')   => '-'
//   firstWord(['coco', 'cocoa'], 'coco') => 'coco'
//
// Run: npm test -- 01-array-of-words

function getCountMap(value){
    let noteMap = new Map();
    for (const letter of value){
        let count = noteMap.get(letter)??0;
        noteMap.set(letter,count+1);
    }
    return noteMap;
}


export function firstWord(words, note) {
    const noteMap = getCountMap(note);
    let letter = "-"
    for (const word of words){
        let wordMap = getCountMap(word);
        let wordMatches = []
        for (const [key, value] of wordMap.entries()){
            let noteMapValue = noteMap.get(key)
            if (noteMapValue && value<=noteMapValue){
                wordMatches.push(true)
            } else {
                wordMatches.push(false)
            }
        }
        if (wordMatches.every((value)=>value)){
            letter = word;
            break
        }
    }
    return letter
}