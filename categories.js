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
    console.log(urbanDataInfo);
    return urbanDataInfo["categories"];
  })
}

function cityInput2(e) {
  e.preventDefault();
  let cityName2 = $("#city2").val();
  let scoreArray2 = [`${cityName2}`];
  let dataArray2 = [];
  getData(cityName2).then(categories => {
    $("#categoryNames2").html("");
    for (let i = 0; i < categories.length; i++) {
      let scoreArray = [];
      let dataObj = {};
      dataObj.name = categories[i]["name"];
      dataObj.score = Math.round(categories[i].score_out_of_10*10);
      dataArray2.push(dataObj);
      // nameArray.push(categories[i]["name"]);
      scoreArray.push(Math.round(categories[i].score_out_of_10*10));
      scoreArray2.push(scoreArray);

      $('#categoryNames2').append(`<div id="catName2-${i}">${categories[i]["name"]}</div>`);
      // $(`#catName2-${i}`).append(`<div>Score: ${Math.round(categories[i].score_out_of_10*10)}</div>`);
    }

    cityInput1().then((scoreArray1) => {
      createChartArray(scoreArray1, scoreArray2);
    });
  });
  console.log(dataArray1);
  console.log(dataArray2);
}

function cityInput1() {
  let cityName1 = $("#city1").val();
  return getData(cityName1).then(categories => {
    $("#categoryNames1").html("");
    let scoreArray1 = [`${cityName1}`];
    let dataArray1 = [];
    for (let i = 0; i < categories.length; i++) {
      let scoreArray = [];
      let dataObj = {};
      dataObj.name = categories[i]["name"];
      dataObj.score = Math.round(categories[i].score_out_of_10*10);
      dataArray1.push(dataObj);

      scoreArray.push(Math.round(categories[i].score_out_of_10*10));
      scoreArray1.push(scoreArray);
      $('#categoryNames1').append(`<div id="catName1-${i}">${categories[i]["name"]}</div>`);
      // $(`#catName1-${i}`).append(`<div>Score: ${Math.round(categories[i].score_out_of_10*10)}</div>`)
    }

    return Promise.resolve(scoreArray1);
  });
}

function createChartArray(scoreArray2, scoreArray1) {
  // let chartArray = ["categories"]
  // for (let i = 0; i < scoreArray2.length; i++) {
  //   scoreArray2[i].push(scoreArray1[i]);
  //   chartArray.push(scoreArray2[i]);
  // }
  var chart = c3.generate({
    bindto: chart,
    data: {
      columns: [scoreArray1, scoreArray2],
      type: 'bar'
    },
    bar: {
      width: {
          ratio: 0.5
      }
    },
    axis: {
      x: {
        type: 'category',
        categories: ['Housing', 'Cost of Living', 'Startups', 'Venture Capital', 'Travel Connectivity', 'Commute',
                    'Business Freedom', 'Safety', 'Healthcare', 'Education', 'Environmental Quality', 'Economy',
                    'Taxation', 'Internet Access', 'Leisure & Culture', 'Tolerance', 'Outdoors']
      }
    }
  });
}

$("#cityForm2").on("submit", cityInput2);


})();
