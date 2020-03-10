const models = require("../models");
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const {google} = require('googleapis');
const OAuth2 = google.auth.OAuth2;

let youtubeController = {};
let authGlobal;

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/youtube-nodejs-quickstart.json
let SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
const TOKEN_DIR = path.join(__dirname, '../.credentials');
let TOKEN_PATH = TOKEN_DIR + '/youtube-nodejs-quickstart.json';
console.log("TOKEN_PATH", TOKEN_PATH)
// Load client secrets from a local file.
fs.readFile('youtube-client-secret.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
  // Authorize a client with the loaded credentials, then call the YouTube API.
  authorize(JSON.parse(content), getChannel);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  let clientSecret = credentials.installed.client_secret;
  let clientId = credentials.installed.client_id;
  let redirectUrl = credentials.installed.redirect_uris[0];
  let oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      authGlobal = oauth2Client;
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  let authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
      authGlobal = oauth2Client;
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    if (err) throw err;
    console.log('Token stored to ' + TOKEN_PATH);
  });
}

/**
 * Lists the names and IDs of up to 10 files.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function getChannel(auth) {
  //let service = google.youtube('v3');
  // service.channels.list({
  //   auth: auth,
  //   part: 'snippet,contentDetails,statistics',
  //   forUsername: 'GoogleDevelopers'
  // }, function(err, response) {
  //   if (err) {
  //     console.log('The API returned an error: ' + err);
  //     return;
  //   }
  //   let channels = response.data.items;
  //   if (channels.length == 0) {
  //     console.log('No channel found.');
  //   } else {
  //     console.log('This channel\'s ID is %s. Its title is \'%s\', and ' +
  //                 'it has %s views.',
  //                 channels[0].id,
  //                 channels[0].snippet.title,
  //                 channels[0].statistics.viewCount);
         
  //   }
  // });
  // console.log("auth ==>", auth)
  // service.search.list({
  //   auth: auth,
  //   part: 'snippet',
  //   q: 'dogs',
  //   type: 'video',
  //   maxResults: 25
  // }, (err, results) => {
  //   console.log("service err  =>>>>", err)
  //   console.log("results", results)
  //   if(results != undefined && results.data != undefined) {
  //     let dataItems = results.data.items;
  //     let firstList = [];
  //     let otherList = [];
  //     if(dataItems != null && dataItems.length > 0) {
  //       for (let index = 0; index < dataItems.length; index++) {
  //         if(index == 0){
  //           firstList.push(dataItems[index]);
  //         } else {
  //           const element = dataItems[index];
  //           otherList.push(element);
  //         }       
  //       }
  //     }
  //     console.log("searchList", otherList);
  //     console.log("showList", firstList);
  //   }

  //   //res.render('index', { title: 'Express', ErrorDescription: '', searchList: otherList, showList: firstList});
  // });

  // videos.list(
  //   part="snippet,contentDetails,statistics",
  //   id="t_Lg8HCKq8g"
  // )
 }


youtubeController.get = (req, res) => {
  let service = google.youtube('v3');
  console.log("videos", service)
  service.videos.list({
    auth: authGlobal,
    // part: 'snippet',
    // hl: "ta",
    // q: 'dogs',
    // type: 'video',
    // maxResults: 25,
    part: "snippet,contentDetails,statistics",
    chart: "mostPopular"
  }, (err, results) => {
    console.log("videos results", results)
    let dataItems = [], firstList = [], otherList = [];
    if(results != undefined) {
      dataItems = results.data.items;
      if(dataItems != null && dataItems.length > 0) {
        for (let index = 0; index < dataItems.length; index++) {
          if(index == 0){
            firstList.push(dataItems[index]);
          } else {
            const element = dataItems[index];
            otherList.push(element);
          }       
        }
      }
      res.render('./youtube/home', {title: 'Home', errorDescription: '', isCardType: ((req.session.LoggedIn["isCardType"] != undefined && req.session.LoggedIn["isCardType"] == false) ? false : true), totalList: dataItems, relatedList: otherList, playList: firstList});
    }  else {
      res.render('./youtube/home', {title: 'Home', errorDescription: 'Error On youtube integration.', isCardType: ((req.session.LoggedIn["isCardType"] != undefined && req.session.LoggedIn["isCardType"] == false) ? false : true), totalList: dataItems, relatedList: otherList, playList: firstList});
    }   
  });
};

youtubeController.onPlayHome = (req, res) => {
  let dataItems = [], firstList = [], otherList = [];
  if(req.body != undefined) {
    dataItems = req.body;
    if(dataItems != null && dataItems.length > 0) {
      otherList = dataItems.filter((data) => {
        if(data.id["videoId"] != req.body["searchVideo"]) {
          return data;
        }
      });
      firstList = dataItems.filter((data) => {
        if(data.id["videoId"] == req.body["searchVideo"]) {
          return data;
        }
      });
    }
    res.render('./youtube/home', {title: 'Home', errorDescription: '', isCardType: false, totalList: dataItems, relatedList: otherList, playList: firstList});
  }  else {
    res.render('./youtube/home', {title: 'Home', errorDescription: 'Error On youtube integration.', isCardType: false, totalList: dataItems, relatedList: otherList, playList: firstList});
  }
};

module.exports = youtubeController;