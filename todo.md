- make procental loading in Generating msg
- add field for storepage link as window.location.href+"?fileid="+fileid
- make each column title be capitalized with following function:
'''
function capitalizeString(inputString, first = true) {
    if (first) {
        // Capitalize the first letter of the first word
        return inputString.charAt(0).toUpperCase() + inputString.slice(1);
    } else {
        // Capitalize the first letter of each word
        let words = inputString.split(' ');
        for (let i = 0; i < words.length; i++) {
            words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
        }
        return words.join(' ');
    }
}
'''