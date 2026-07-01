// TODO: Implement `wrapLines(words, maxLen)`.
//
// Given an array of `words` and a maximum line length `maxLen`, greedily pack
// the words onto lines. Words on the same line are joined by a single hyphen
// ('-'), which counts toward the line length. Start a new line whenever adding
// the next word would make the line exceed `maxLen`. A word is always placed on
// a line even if it alone is longer than `maxLen`. Return the array of lines.
//
//   wrapLines(['a', 'b', 'c'], 5)              => ['a-b-c']
//   wrapLines(['hello', 'world', 'foo'], 11)   => ['hello-world', 'foo']
//
// Run: npm test -- 02-word-wrap


export function wrapLines(words, maxLen) {
    let list = [];
    function recursive(words,maxLen){
        let values = [];
        let index = 0;
        if (words.length === 1){
            list.push(words[0])
        } else {
            let flag = true;
            while (flag){
                let newValues = [...values, words[index]]
                if (newValues.join("-").length<=maxLen){
                    values.push(words[index])
                    index++
                } else {
                    flag = false;
                }
            }
            const output =  values.filter(value=>value).join("-")
            if (output!==""){
                list.push(output)
                return recursive(words.slice(index), maxLen);
            }
        }
        return list;
    }
    return recursive(words,maxLen);

}
