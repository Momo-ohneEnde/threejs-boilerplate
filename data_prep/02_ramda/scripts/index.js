/* 
Allgemeine Informationen
Autorin: Marina Lehmann
Topic: Datenvorbereitung der Propyläen-Daten für die 3D-Visualisierung mit three.js

*/

// 1.) Variablen

// 1.1) Dateninfo
const datainfo = {
  dataPlaces: {
    uniquePlaceNames: [],
    uniquePlaceIds: [],
    numUniquePlaceNames: 0,
    numUniquePlaceId: 0,
  },
  dataPersons: {
    uniqueReceiverNames: [],
    uniqueReceiverIds: [],
    uniqueReceiverKeys: [],
    numUniqueReceiverNames: 0,
    numUniqueReceiverIds: 0,
    numUniqueReceiverKeys: 0,
    numLettersPerPerson: 0,
  },
  dataDates: {
    uniqueYears: [],
    numUniqueYears: 0,
    numLettersPerYear: 0,
  },
};

// GND API
const gndAPI = "https://lobid.org/gnd/"; // -> Variables

// geonames API
//const geoAPI = "http://api.geonames.org/getJSON?formatted=true";

// 2.) Funktionen
// 2.1.) Löschung von Klammern
const deleteBracketsPlaceSent = (letter) => {
  return { ...letter, placeSent: R.replace(/[〈|〉]/g, "", letter.placeSent) };
};

const deleteBracketsPlaceReceived = (letter) => {
  return {
    ...letter,
    placeReceived: R.replace(/[〈|〉]/g, "", letter.placeReceived),
  };
};

// 2.2.) Standardisierung von Namen

const standardizePlaceName = (letter) => {
  return {
    ...letter,
    placeSent: R.replace(
      letter.placeSent.trim(),
      getReplaceStringPlaces(letter.placeSent.trim()),
      letter.placeSent
    ),
    placeReceived: R.replace(
      letter.placeReceived.trim(),
      getReplaceStringPlaces(letter.placeReceived.trim()),
      letter.placeReceived
    ),
  };
};

// 2.3 Helper Functions

// for replacement of place names
const getReplaceStringPlaces = (searchstring) => {
  switch (searchstring) {
    case "Frankfurt am Main":
      return "Frankfurt";
      break;
    case "Frankfurt a. M.":
      return "Frankfurt";
      break;
    case "Ehrenbreitstein bei Koblenz":
      return "Ehrenbreitstein";
      break;
    default:
      return searchstring;
      break;
  }
};

// for replacement of month names
const getReplaceStringMonths = (searchstring) => {
  switch (searchstring) {
    case "01":
      return "Januar";
      break;
    case "02":
      return "Februar";
      break;
    case "03":
      return "März";
      break;
    case "04":
      return "April";
      break;
    case "05":
      return "Mai";
      break;
    case "06":
      return "Juni";
      break;
    case "07":
      return "Juli";
      break;
    case "08":
      return "August";
      break;
    case "09":
      return "September";
      break;
    case "10":
      return "Oktober";
      break;
    case "11":
      return "November";
      break;
    case "12":
      return "Dezember";
      break;
  }
};

// replace gender with boolean
// "Männlich" -> 0, "Weiblich" -> 1
// aktuell doch nicht erforderlich, da es manchmal keine Angabe zum Geschlecht gibt (z.B. Pog, Familie Goethe)
// und somit eine dritte Kategorie erforderlich ist

/* const genderToBool = async (genderString) => {
  switch (genderString) {
    case "Männlich":
      return 0;
      break;
    case "Weiblich":
      return 1;
      break;
  }
} */

// formatId
// GB01_1_BR060_0 -> GB01 Nr.60
const formatId = (id) => {
  const typeAndVolume = R.concat(id.split("_")[0], " "); // e.g. GB01
  const letterNumber = R.replace(/BR[0]*/g, "", id.split("_")[2]); // e.g. 60 oder EB060
  return R.concat(typeAndVolume, R.concat("Nr.", letterNumber));
};

// test functions for receiver output
/* const receiverId = (letter) => { 
  R.map(console.log(letter.receiverId));
  return letter; 
};

const receiverKey = (letter) => { 
  R.map(console.log(letter.receiverKey));
  return letter; 
};

const receiver = (letter) => {
  R.map(console.log(letter.receiver))
  return letter;
}

const lobid = (letter) => {
  R.map(console.log(letter.lobidURL))
  return letter;
} */

// flatten json objects to array
// before: json = [{key1:value1}, {key2:value2}, ...]
// after: json = [value1, value2, ...]
const flattenJsonDownload = (json) => {
  let flat = [];
  for (let obj of json) {
    let valueArray = Object.values(obj);
    flat = flat.concat(valueArray);
  }
  console.log(flat);
  onDownloadDataFlat(flat);
};

// 2.4 Info und Logging Functions

const getInfo = (json) => {
  //console.log(json);

  // SET PLACE INFO
  // creates lists of all places sent and received and concats them into one list
  const placeNames = R.concat(
    R.map((i) => i.placeSent)(json),
    R.map((i) => i.placeReceived)(json)
  );
  // returns a list of all unique place names and assigns it to the field "uniquePlaceNames" within the datainfo object
  datainfo.dataPlaces.uniquePlaceNames = R.uniq(placeNames);

  // number of unique place names
  datainfo.dataPlaces.numUniquePlaceNames =
    datainfo.dataPlaces.uniquePlaceNames.length;

  // list of unique place ids
  const placeIds = R.concat(
    R.map((i) => i.placeSentId)(json),
    R.map((i) => i.placeReceivedID)(json)
  );
  datainfo.dataPlaces.uniquePlaceIds = R.uniq(placeIds);

  // number of unique place ids
  datainfo.dataPlaces.numUniquePlaceId =
    datainfo.dataPlaces.uniquePlaceIds.length;

  // SET RECEIVER INFO
  // list of unique receiver names
  const receiverNames = R.map((i) => i.receiver)(json);
  datainfo.dataPersons.uniqueReceiverNames = R.uniq(receiverNames);

  // number of unique receiver names
  datainfo.dataPersons.numUniqueReceiverNames =
    datainfo.dataPersons.uniqueReceiverNames.length;

  // list of unique receiver ids
  const receiverIds = R.map((i) => i.receiverId)(json);
  datainfo.dataPersons.uniqueReceiverIds = R.uniq(receiverIds);

  // number of unique receiver ids
  datainfo.dataPersons.numUniqueReceiverIds =
    datainfo.dataPersons.uniqueReceiverIds.length;

  // list of unique receiver keys
  const receiverKeys = R.map((i) => i.receiverKey)(json);
  datainfo.dataPersons.uniqueReceiverKeys = R.uniq(receiverKeys);

  // number of unique receiver keys
  datainfo.dataPersons.numUniqueReceiverKeys =
    datainfo.dataPersons.uniqueReceiverKeys.length;

  // number of letters associated to each person
  const letterPerPerson = R.countBy((i) => i.receiver)(json);
  datainfo.dataPersons.numLettersPerPerson = letterPerPerson;

  // SET DATE INFO
  // list of unique years
  const years = R.map((i) => i.year)(json);
  datainfo.dataDates.uniqueYears = R.uniq(years);

  // number of unique years
  datainfo.dataDates.numUniqueYears = datainfo.dataDates.uniqueYears.length;

  // number of letters associated to each year
  const letterPerYear = R.countBy((i) => i.year)(json);
  datainfo.dataDates.numLettersPerYear = letterPerYear;

  console.log(datainfo);
  onDownloadDataInfo(datainfo);
};

// 2.5) Enhancement Functions
const addFieldYear = (letter) => {
  return { ...letter, year: letter.date.split("-")[0] };
};

const addFieldMonth = (letter) => {
  return { ...letter, month: letter.date.split("-")[1] };
};

const addFieldDay = (letter) => {
  return { ...letter, day: letter.date.split("-")[2] };
};

const addDateFormatted = (letter) => {
  // check first whether a day exists (sometimes it's only month and year: 1774-09)
  // if exists: output format = 02. August 1774
  // if not exists: output format = August 1774
  if (letter.date.split("-")[2] != undefined) {
    return {
      ...letter,
      dateFormatted: R.concat(
        R.concat(
          R.concat(letter.day, ". "),
          R.concat(getReplaceStringMonths(letter.month), " ")
        ),
        R.concat(letter.year, "")
      ),
    };
  } else {
    return {
      ...letter,
      dateFormatted: R.concat(
        R.concat(getReplaceStringMonths(letter.month), " "),
        R.concat(letter.year, "")
      ),
    };
  }
};

const addDocumentType = (letter) => {
  if (R.match(/GB/g, letter.id))
    return {
      ...letter,
      type: "GB",
    };
};

const addIdFormatted = (letter) => {
  return {
    ...letter,
    idFormatted: formatId(letter.id),
  };
};

const addReceiverFirstname = (letter) => {
  if (letter.receiver.split(",")[1] != undefined) {
    return {
      ...letter,
      receiverFirstName: letter.receiver.split(",")[1].trim(),
    };
  } else {
    return {
      ...letter,
      receiverFirstName: "",
    };
  }
};

const addReceiverLastname = (letter) => {
  if (letter.receiver.split(",")[0] != undefined) {
    return {
      ...letter,
      receiverLastName: letter.receiver.split(",")[0].trim(),
    };
  } else {
    return {
      ...letter,
      receiverLastName: "",
    };
  }
};

const addReceiverFormatted = (letter) => {
  return {
    ...letter,
    receiverFormatted: R.concat(
      R.concat(letter.receiverFirstName, " "),
      letter.receiverLastName
    ),
  };
};

const addReceiverInitials = (letter) => {
  const firstFirstname = letter.receiverFirstName.split(" ")[0]; // Ernst Wolfgang -> Ernst
  const firstLastname = letter.receiverLastName.split(" ")[0]; // La Roche -> La
  const firstInitial = R.replace(
    /[a-z\u00e4\u00f6\u00fc]/g,
    "",
    firstFirstname
  ); // Ernst -> E, \u00e4\u00f6\u00fc -> ä, ö, ü
  const secondInitial = R.replace(
    /[a-z\u00e4\u00f6\u00fc]/g,
    "",
    firstLastname
  ); // La -> L

  return {
    ...letter,
    //receiverInitials: R.concat(R.concat(firstInitial, "."), R.concat(secondInitial, "."))
    receiverInitials: R.concat(firstInitial, secondInitial),
  };
};

const addpropyURL = (letter) => {
  return {
    ...letter,
    // perspektivisch sollte hier der Permalink zur Einzelansicht des jeweiligen Zeugnisses eingefügt werden
    propyURL: "https://goethe-biographica.de/",
  };
};

const addLobidURL = (letter) => {
  if (letter.receiverId.split("/")[4] != undefined) {
    const gndNumber = letter.receiverId.split("/")[4].trim();
    return {
      ...letter,
      lobidURL: `${gndAPI}${gndNumber}`, // für URLs und co ist ein template string übersichtlicher
    };
  } else {
    return {
      ...letter,
      lobidURL: undefined,
    };
  }
};

const addLetterStatusSent = (letter) => {
  return {...letter, letterStatus: "sent"};
}

const addLetterStatusReceived = (letter) => {
  return {...letter, letterStatus: "received"};
}

const addLetterStatusSentToId = (letter) => {
  return {...letter, id: `${letter.id}_s`};
}

const addLetterStatusReceivedToId = (letter) => {
  return {...letter, id: `${letter.id}_r`};
}

const addLetterStatusSentToIdFormatted = (letter) => {
  return {...letter, idFormatted: `${letter.idFormatted} S`};
}

const addLetterStatusReceivedToIdFormatted = (letter) => {
  return {...letter, idFormatted: `${letter.idFormatted} R`};
}

// 2.6) API related functions

async function getGender(letter) {
  //console.log(letter.lobidURL);
  if (hasLobid(letter)) {
    //console.log(letter.lobidURL);
    const g = await fetch(letter.lobidURL)
      .then((res) => res.json())
      .then((data) => data.gender[0].label);
    //.then((gender) => genderToBool(gender)); // aktuell doch nicht erforderlich
    return g; // returns promise
  } else {
    return "Keine Info";
  }
}

const addGender = async (letter) => {
  return {
    ...letter,
    receiverGender: await getGender(letter),
  };
};

async function getLatitudeSent(letter) {
  const geoAPI = "http://api.geonames.org/getJSON?formatted=true";
  if (letter.placeSentId.split("/")[3].trim() != undefined) {
    const idNr = letter.placeSentId.split("/")[3].trim();
    const geoApiUrl = `${geoAPI}&geonameId=${idNr}&username=morle404`;
    const geo = await fetch(geoApiUrl)
      .then((res) => res.json())
      .then((data) => data.lat);
    return geo;
  } else {
    return "Keine Info";
  }
}

// getLongitudeSent
async function getLongitudeSent(letter) {
  const geoAPI = "http://api.geonames.org/getJSON?formatted=true";
  if (letter.placeSentId.split("/")[3].trim() != undefined) {
    const idNr = letter.placeSentId.split("/")[3].trim();
    const geoApiUrl = `${geoAPI}&geonameId=${idNr}&username=morle404`;
    const geo = await fetch(geoApiUrl)
      .then((res) => res.json())
      .then((data) => data.lng);
    return geo;
  } else {
    return "Keine Info";
  }
}
// getLatitudeReceived
async function getLatitudeReceived(letter) {
  const geoAPI = "http://api.geonames.org/getJSON?formatted=true";
  if (letter.placeReceivedID.split("/")[3].trim() != undefined) {
    const idNr = letter.placeReceivedID.split("/")[3].trim();
    const geoApiUrl = `${geoAPI}&geonameId=${idNr}&username=morle404`;
    const geo = await fetch(geoApiUrl)
      .then((res) => res.json())
      .then((data) => data.lat);
    return geo;
  } else {
    return "Keine Info";
  }
}
// getLongitudeReceived
async function getLongitudeReceived(letter) {
  const geoAPI = "http://api.geonames.org/getJSON?formatted=true";
  if (letter.placeReceivedID.split("/")[3].trim() != undefined) {
    const idNr = letter.placeReceivedID.split("/")[3].trim();
    const geoApiUrl = `${geoAPI}&geonameId=${idNr}&username=morle404`;
    const geo = await fetch(geoApiUrl)
      .then((res) => res.json())
      .then((data) => data.lng);
    return geo;
  } else {
    return "Keine Info";
  }
}

// addLatitudeSent
const addLatitudeSent = async (letter) => {
  return {
    ...letter,
    placeSentLat: await getLatitudeSent(letter),
  };
};

// addLongitudeSent
const addLongitudeSent = async (letter) => {
  return {
    ...letter,
    placeSentLong: await getLongitudeSent(letter),
  };
};

// addLatitudeReceived
const addLatitudeReceived = async (letter) => {
  return {
    ...letter,
    placeReceivedLat: await getLatitudeReceived(letter),
  };
};
// addLongitudeReceived
const addLongitudeReceived = async (letter) => {
  return {
    ...letter,
    placeReceivedLong: await getLongitudeReceived(letter),
  };
};

// 2.7) Download Functions

function download(content, fileName, contentType) {
  const a = document.createElement("a");
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}

function onDownloadData(json) {
  download(
    JSON.stringify(json),
    "letters_json_prepared.json",
    "application/json"
  );
}

function onDownloadDataInfo(json) {
  download(JSON.stringify(json), "datainfo.json", "application/json");
}

function onDownloadDataFlat(json) {
  download(
    JSON.stringify(json),
    "letters_json_prepared_flat.json",
    "application/json"
  );
}

function groupedJsonDownloadSent(json) {
  download(
    JSON.stringify(json),
    "letters_json_grouped_sent.json",
    "application/json"
  );
}

function groupedJsonDownloadReceived(json) {
  download(
    JSON.stringify(json),
    "letters_json_grouped_received.json",
    "application/json"
  );
}

// 3.) Prädikate
const hasDate = (letter) => {
  return letter.date != "";
};

const hasPlaces = (letter) => {
  return (
    letter.placeSent != "" ||
    letter.placeSent != "unknow" ||
    letter.placeReceived != "" ||
    letter.placeReceived != "unknow"
  );
};

const hasLobid = (letter) => {
  return (
    letter.lobidURL != "" &&
    letter.lobidURL != undefined &&
    !R.contains("subjects", letter.lobidURL) // http:\/\/www.lagis-hessen.de\/de\/subjects\/idrec\/sn\/bio\/id\/10458 wird ignoriert
  );
};

// 4.) Pipes
// 4.1) Clean up
const pipeClean = R.pipe(
  R.map(deleteBracketsPlaceSent),
  R.map(deleteBracketsPlaceReceived)
);

// 4.2) Normalisierung
const pipeStandardize = R.pipe(R.map(standardizePlaceName));

// 4.3) Filtern
// Nur Datensätze mit Datum sowie mindestens einem Ort, sollen berücksichtigt werden
const pipeFilter = R.pipe(R.filter(hasDate), R.filter(hasPlaces));

const pipeInfo = R.pipe(
  R.bind(Promise.all, Promise), // Promises müssen intern an eine andere Variable gebunden werden, danach wird mit R.andThen darauf zugegriffen
  R.tap(R.andThen(getInfo))
);

// 4.4) Enhance
const pipeEnhance = R.pipe(
  R.map(addFieldYear),
  R.map(addFieldMonth),
  R.map(addFieldDay),
  R.map(addDateFormatted),
  R.map(addDocumentType),
  R.map(addIdFormatted),
  R.map(addReceiverFirstname),
  R.map(addReceiverLastname),
  R.map(addReceiverFormatted),
  R.map(addReceiverInitials),
  R.map(addLobidURL),
  R.map(addpropyURL),
  R.map(addGender), // gibt Promises zurück, daher R.andThen notwendig
  R.map(R.andThen(addLatitudeSent)),
  R.map(R.andThen(addLongitudeSent)),
  R.map(R.andThen(addLatitudeReceived)),
  R.map(R.andThen(addLongitudeReceived))
  //R.tap(R.andThen(console.log)),
);

// 5.) Grouping Pipe
const pipeGrouping = R.pipe(
  R.tap(
    R.pipe(
      R.map(addLetterStatusSent),
      R.map(addLetterStatusSentToId),
      R.map(addLetterStatusSentToIdFormatted),
      R.groupBy((json) => {
        return json.placeSent;
      }),
      (json) => {
        Object.keys(json).forEach((key) => {
          json[key] = R.groupBy((i) => i.year, json[key]);
        });
        return json;
      },
      groupedJsonDownloadSent
    )
  ),
  R.tap(
    R.pipe(
      R.map(addLetterStatusReceived),
      R.map(addLetterStatusReceivedToId),
      R.map(addLetterStatusReceivedToIdFormatted),
      R.groupBy((json) => {
        return json.placeReceived;
      }),
      (json) => {
        Object.keys(json).forEach((key) => {
          json[key] = R.groupBy((i) => i.year, json[key]);
        });
        return json;
      },
      groupedJsonDownloadReceived
    )
  )
);

// 6.) Main

fetch("gb_01_compact_array.json")
  .then((response) => response.json())
  .then((json) => {
    return R.pipe(
      pipeClean,
      pipeStandardize,
      pipeFilter,
      pipeEnhance,
      pipeInfo, // die Promises werden durch pipeInfo weitergereicht // enthält download von Dateninfos
      // R.andThen(R.tap(onDownloadData)), // ab hier geht es nur noch mit R.andThen // downloaded JSON als Array mit Objekten
      //R.andThen(R.tap(flattenJsonDownload)), // downloaded JSON als eindimensionalen Array
      R.andThen(pipeGrouping),
      R.andThen(console.log)
    )(json);
  });
