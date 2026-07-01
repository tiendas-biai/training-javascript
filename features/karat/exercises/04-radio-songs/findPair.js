// TODO: Implement `findPair(songs)`.
//
// Each song is an object { title, duration } where duration is a "M:SS" string
// (e.g. "3:41"). Return a pair of titles [titleA, titleB] for two DIFFERENT
// songs whose durations add up to exactly 7 minutes (7:00). If no such pair
// exists, return []. If several pairs qualify, returning any one of them is fine.
//
//   findPair([
//     { title: 'Rock and Roll', duration: '3:41' },
//     { title: 'Hot Dog', duration: '3:19' },
//   ]) => ['Rock and Roll', 'Hot Dog']  (in either order)
//
// Run: npm test -- 04-radio-songs

function getSeconds(date) {
    let [minutes, seconds] = date.split(":")
    minutes = parseInt(minutes);
    seconds = parseInt(seconds);
    return minutes*60+seconds;
}

function datesSum7minutes(date1,date2){
    return getSeconds(date1) + getSeconds(date3) === 7 * 60;
}

export function findPair(songs) {
    let pair = [];
    for (let song of songs){
        for (let songToCompare of songs){
            if (songToCompare.title !== song.title){
                console.log(`${song.title} vs ${songToCompare.title}`)
                if (datesSum7minutes(songToCompare.duration, song.duration)){
                    pair.push(songToCompare.title);
                    pair.push(song.title);
                    break
                }
            }
        }
    }
    return Array.from(new Set(pair));
}
