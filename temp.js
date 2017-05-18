(function() {

const CITY_URL = 'https://api.teleport.org/api/cities/?search='
const GEONAMEID_URL = 'https://api.teleport.org/api/cities/'
const URBANAREA_URL = 'https://api.teleport.org/api/urban_areas/'

const getData = function(cityName) {
  let request = fetch(CITY_URL + cityName);
  return request
  .then(city => {
    return city.json();
  })
  //get city id from city name data
  // .then(city => {
  //   let cityGeoId = city["_embedded"]["city:search-results"]["0"]["_links"]["city:item"]["href"].slice(36,53);
  //   return cityGeoId;
  // })
  //fetch city id data
  .then(cityData => {
    let dataPromise = fetch(GEONAMEID_URL + cityData["_embedded"]["city:search-results"]["0"]["_links"]["city:item"]["href"].slice(36,53));
    return dataPromise;
  })
  .then(dataJson => {
    return dataJson.json()
  })
  //fetch urban area specific data
  .then(data => {
    let urbanAreaData = fetch(URBANAREA_URL + data["_links"]["city:urban_area"]["href"].slice(41) + "scores/")
    return urbanAreaData;
  })
  .then(urbanData => {
    return urbanData.json();
  })
  //access living scores for specific urban area
  .then(urbanDataInfo => {
    return urbanDataInfo["categories"];
  })
}

function cityInput2(e) {
  e.preventDefault();
  let cityName2 = $("#city2").val();
  let dataArray2 = [];
  getData(cityName2).then(categories => {
    $("#categoryNames2").html("");
    for (let i = 0; i < categories.length; i++) {
      let array = [];
      array.push(categories[i]["name"]);
      array.push(Math.round(categories[i].score_out_of_10*10));
      dataArray2.push(array);

      $('#categoryNames2').append(`<div id="catName2-${i}">${categories[i]["name"]}</div>`);
      $(`#catName2-${i}`).append(`<div>Score: ${Math.round(categories[i].score_out_of_10*10)}</div>`)
    }

    cityInput1().then((dataArray1) => {
      createChartArray(dataArray1, dataArray2);
    });
  });
}

function cityInput1() {
  let cityName1 = $("#city1").val();
  return getData(cityName1).then(categories => {
    $("#categoryNames1").html("");
    let dataArray1 = [];
    for (let i = 0; i < categories.length; i++) {
      let array = [];
      array.push(categories[i]["name"]);
      array.push(Math.round(categories[i].score_out_of_10*10));
      dataArray1.push(array);
      $('#categoryNames1').append(`<div id="catName1-${i}">${categories[i]["name"]}</div>`);
      $(`#catName1-${i}`).append(`<div>Score: ${Math.round(categories[i].score_out_of_10*10)}</div>`)
    }

    return Promise.resolve(dataArray1);
  });
}

function createChartArray(dataArray2, dataArray1) {
  let chartArray = []
  for (let i = 0; i < dataArray2.length; i++) {
    dataArray2[i].push(dataArray1[i][1]);
    chartArray.push(dataArray2[i]);
    console.log(chartArray);
  }
  var chart = c3.generate({
    bindto: chart,
    data: {
      columns: chartArray,
      type: 'bar'
    },
    bar: {
      width: {
          ratio: 0.5 // this makes bar width 50% of length between ticks
      }
      // or
      //width: 100 // this makes bar width 100px
    }
  });
}


// var chart = c3.generate({
//   data: {
//     columns: [
//                 ['data1', 30, 200, 100, 400, 150, 250],
//                 ['data2', 130, 100, 140, 200, 150, 50]
//             ],
//     type: 'bar'
//   },
//   bar: {
//     width: {
//         ratio: 0.5 // this makes bar width 50% of length between ticks
//     }
//     // or
//     //width: 100 // this makes bar width 100px
//   }
// });

$("#cityForm2").on("submit", cityInput2);


})();
