import { cyan, bold, dim } from "kolorist";
const art = `
                   ###############                     
                #####################                  
              #########################                
            ############################               
           ##############################              
           ###############################             
          #################################            
          #################################            
 ##########################################            
**************************#########**+++++++++++       
**************************######*+++++++++++++++++*    
**********+:.....=********####**+++++++++++++++++++++  
********+..:----:=********###*++++++++++++++++++++++++ 
********-..***************##*++++++++++++++++++++++++++
********+...:=+***********##*++++++++++++++++++++++++++
**********=:....:+********##*++++++++++++++++++++++++++
*************+-...=*******##*++++++++++++++++++++++++++
***************+:.-*******#*+==++++++++++++++++++++++++
********=::---::..=*******#*=======++++++++++++++++++++
********=......:+*********#*========++++++++++++++++++ 
**************************#*==========+++++++++++++++  
#*************************#*==========+++++++++++++*   
 *#*************###########+===========++++++++++      
                =======================+++++++         
                ========================               
                 ======================                
                  ====================                 
                   =================                   
                      ============                     
`;
// Approximate SharePoint teal palette
const PALETTE = {
    darkTeal: '#0E6668',
    midTeal: '#1A8E94',
    lightTeal: '#3EC7CD',
    lightCyan: '#7FE6EB',
    shadow: '#FFFFFF' //'#0B4D4F'
};
function hexToRgb(hex) {
    const h = hex.replace('#', '');
    const bigint = parseInt(h, 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}
function color(hex, s) {
    const [r, g, b] = hexToRgb(hex);
    return `\x1b[38;2;${r};${g};${b}m${s}\x1b[0m`;
}
function colorizeChar(ch) {
    switch (ch) {
        case '#': return color(PALETTE.darkTeal, ch);
        case '*': return color(PALETTE.midTeal, ch);
        case '+': return color(PALETTE.lightTeal, ch);
        case '=': return color(PALETTE.lightCyan, ch);
        case ':':
        case '-':
        case '.': return color(PALETTE.shadow, ch);
        default: return ch; // spaces and others
    }
}
/**
 * Prints a SharePoint-y ASCII splash with color.
 * Call at app startup. Optionally pass an app name/subtitle.
 */
export function showSplash(appName, subtitle) {
    // palette: two teals/cyans + white text + dim accents
    const T2 = cyan; // light teal
    // Title banner (monospace-friendly)
    const title = bold(`
 ____  _                     ____       _       _   
/ ___|| |__   __ _ _ __ ___ |  _ \\ ___ (_)_ __ | |_ 
\\___ \\| '_ \\ / _\` | '__/ _ \\| |_) / _ \\| | '_ \\| __|
 ___) | | | | (_| | | |  __/|  __/ (_) | | | | | |_ 
|____/|_| |_|\\__,_|_|  \\___||_|   \\___/|_|_| |_|\\__|
`);
    const label = `${bold(T2(`\n${appName}`))}  ${dim(`— ${subtitle}`)}`;
    for (const line of art.replace(/\r\n/g, '\n').split('\n')) {
        let out = '';
        for (const ch of line)
            out += colorizeChar(ch);
        console.log(out);
    }
    console.log("\n" + title + "\n" + label + "\n");
}
