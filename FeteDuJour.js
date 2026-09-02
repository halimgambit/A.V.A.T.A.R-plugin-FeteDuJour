import fetch from "node-fetch";
import * as cheerio from "cheerio";

export async function init () {
    await Avatar.lang.addPluginPak('FeteDuJour');
}

export async function action(data, callback) {

    try {

        const Locale = await Avatar.lang.getPak('FeteDuJour', data.language);
        
        const tblActions = {
            feteJour : () => feteJour(data.client, Locale, callback)                    
        };
        
        info("FeteDuJour:", data.action.command, "from", data.client);
            
        if (tblActions[data.action.command]) {
            await tblActions[data.action.command]();
        } else {
            callback();
        }

    } catch (err) {
        if (data.client) Avatar.Speech.end(data.client);
        if (err.message) error(err.message);
        callback();
    }   
 
}

const feteJour = async (client, Locale, callback) => {

    try {
        const url = "https://fetedujour.fr/";
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(Locale.get(["error.errorHttp", response.status]));
        }

        const body = await response.text();
        const $ = cheerio.load(body);

        const rawText = $('div.fdj h1').text().trim();
        const prenom = rawText.split(':').pop().trim();

        const texte = Locale.get(["speech.name", prenom]);
        
        info(texte);
        
        Avatar.speak(texte, client, () => {
            callback();
        });

    } catch (err) {
        error("FeteDuJour error:", err.message);
        const errMessage = Locale.get("error.errorAccess");
		info(errMessage);
        Avatar.speak(errMessage, client, () => {
            callback();
        });
    }
  
}
