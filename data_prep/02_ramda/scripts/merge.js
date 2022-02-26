Promise.all([
  fetch("../data_prepared/letters_json_grouped_sent.json")
    .then((response) => response.json())
    .then((data) => {
      //console.log(data);
      return data;
    }),
  fetch("../data_prepared/letters_json_grouped_received.json")
    .then((response) => response.json())
    .then((data) => {
      //console.log(data);
      return data;
    }),
])
  .then((fetchArray) => {
    console.log(fetchArray[0]);
    console.log(fetchArray[1]);

    // save place names from both fetched arrays
    const placesSentKeys = Object.keys(fetchArray[0]);
    const placesReceivedKeys = Object.keys(fetchArray[1]);

    // concat place name arrays (filtered by unique values)
    let places = R.uniq(R.concat(placesSentKeys, placesReceivedKeys));

    // create new object
    let mergedObject = {};

    console.log(places);

    //creates mergedObject with "sent" and "received" properties
    /* structure: 
    Object = {
      Wiesbaden: {
        sent: {
          1765: [{...}, {...}],
        },
        received: {...},
      }, ...
    }; */

    places.forEach((place) => {
      console.log(place);
      // check if place name is in list of place names
      // if yes, create a key with the placename
      mergedObject[`${place}`] = {};
      mergedObject[`${place}`]["sent"] = {};
      mergedObject[`${place}`]["received"] = {};

      if (Object.keys(fetchArray[0]).includes(place)) {
        mergedObject[`${place}`]["sent"] = fetchArray[0][`${place}`];
      }

      if (Object.keys(fetchArray[1]).includes(place)) {
        mergedObject[`${place}`]["received"] = fetchArray[1][`${place}`];
      }
    });
    return mergedObject;
  })
  // creates the merged object with additional "years" property
  /* structure: 
  Object {
    "Wiesbaden": {
        "sent": {
            "1765": [{...}, {...}]
        },
        "received": {},
        "years": {
            "1765": [{...},{...}]
        }
    }, ...
  } */
  .then((mergedObject) => {
    Object.keys(mergedObject).forEach((placename) => {
      mergedObject[`${placename}`] = {
        ...mergedObject[`${placename}`],
        // adds the "years" property
        years: R.uniq(
          // creates list of unique years
          R.concat(
            Object.keys(mergedObject[`${placename}`].sent),
            Object.keys(mergedObject[`${placename}`].received)
          )
        ).reduce((obj, year) => {
          // parameters of reduce: anonymous function, empty object as start value
          // parameters of anonymous function: prev = empty object / start value, curr = current year

          // creates empty arrays to collect the letter objects associated to teh current year within the sent and received properties
          let sent = []; // for letter objects
          let received = []; // for letter objects
          // tests if list of places sent includes the current year, if yes -> include associated letter objects in sent array
          if (Object.keys(mergedObject[`${placename}`].sent).includes(year)) {
            sent = mergedObject[`${placename}`].sent[`${year}`];
          }
          // test same for places received
          if (
            Object.keys(mergedObject[`${placename}`].received).includes(year)
          ) {
            received = mergedObject[`${placename}`].received[`${year}`];
          }
          // destructuring of prev, name is the current year, value concatenated array of letter objects in sent and received arrays
          return { ...obj, [year]: R.concat(sent, received) };
        }, {}), // empty object -> obj
      };
    });
    console.log(mergedObject);
    return { ...mergedObject };
  })
  .then((mergedObject) => {
    Object.keys(mergedObject).forEach((placename) => {
      // iterates over placenames in mergedObject and replaces the value with only the information in the years property
      // de facto deletes the "sent" an "received" properties
      mergedObject[`${placename}`] = mergedObject[`${placename}`].years;
    });
    console.log("last: ", mergedObject);
  });
