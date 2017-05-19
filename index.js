(function() {

const CITY_URL = 'https://api.teleport.org/api/cities/?search='
const GEONAMEID_URL = 'https://api.teleport.org/api/cities/'
const URBANAREA_URL = 'https://api.teleport.org/api/urban_areas/'
const CITYPICTURE_URL = 'https://api.gettyimages.com/v3/search/images?fields=id,title,thumb,referral_destinations&sort_order=best&phrase='

const getData = function(cityName) {
  let request = fetch(CITY_URL + cityName);
  return request
  .then(city => city.json())
  //fetch city id data
  .then(cityData => {
    let dataPromise = fetch(GEONAMEID_URL + cityData["_embedded"]["city:search-results"]["0"]["_links"]["city:item"]["href"].slice(36,53));
    return dataPromise;
  })
  .then(dataJson => dataJson.json())
  //fetch urban area specific data
  .then(data => {
    let urbanAreaData = fetch(URBANAREA_URL + data["_links"]["city:urban_area"]["href"].slice(41) + "scores/")
    return urbanAreaData;
  })
  .then(urbanData => urbanData.json())
  //access living scores for specific urban area
  .then(urbanDataInfo => urbanDataInfo)
  .catch((err) => {
    done(err);
  });
}

const cityPicture = function(cityName) {
  let cityNameNoSpace = cityName.replace(/\s+/g, '');
  let request = fetch(`https://api.bigstockphoto.com/2/767514/search/?q=${cityNameNoSpace}`);
  return request
    .then(pictureData => pictureData.json())
}

function cityData(e) {
  e.preventDefault();
  revealHidden();
  let cityName1 = $("#city1").val();
  let cityName2 = $("#city2").val();
  let wikiName1 = cityName1.split(",");
  let wikiName2 = cityName2.split(",");
  let cityNameCap1 = capitalizeWords(cityName1);
  let cityNameCap2 = capitalizeWords(cityName2);

  $('#city1Link').attr("href", `https://en.wikipedia.org/wiki/${wikiName1[0]}`);
  $('#city2Link').attr("href", `https://en.wikipedia.org/wiki/${wikiName2[0]}`);
  $('.city1').html(`${cityNameCap1}`);
  $('.city2').html(`${cityNameCap2}`);

  Promise.all([cityPicture(wikiName1[0]), cityPicture(wikiName2[0])]).then(results => {
    $("#img1").attr("src", `${results[0].data.images[2].small_thumb.url}`);
    $("#img2").attr("src", `${results[1].data.images[2].small_thumb.url}`);
  })


  Promise.all([getData(cityName1), getData(cityName2)]).then(results => {
    let scoreArray1 = city1ScoreData(results[0].categories);
    let scoreArray2 = city2ScoreData(results[1].categories);
    let dataArray1 = city1Data(results[0].categories);
    let dataArray2 = city2Data(results[1].categories);
    $('#summary1').html(`${results[0].summary}`)
    $('#summary2').html(`${results[1].summary}`)

    sortCity1(dataArray1);
    sortCity2(dataArray2);
    createChartArray(scoreArray1, scoreArray2);
  });

  function revealHidden() {
    $('.hidden').removeClass("hidden")
  }

  function city1ScoreData(categories) {
    let scoreArray1 = [`${cityName1}`];
    for (let i = 0; i < categories.length; i++) {
      let scoreArray = [];
      scoreArray.push(Math.round(categories[i].score_out_of_10*10));
      scoreArray1.push(scoreArray);
    }
    return scoreArray1;
  }

  function city2ScoreData(categories) {
    let scoreArray2 = [`${cityName2}`];
    for (let i = 0; i < categories.length; i++) {
      let scoreArray = [];
      scoreArray.push(Math.round(categories[i].score_out_of_10*10));
      scoreArray2.push(scoreArray);
    }
    return scoreArray2;
  }

  function city1Data(categories) {
    let dataArray1 = [`${cityName1}`];
    for (let i = 0; i < categories.length; i++) {
      let dataObj = {};
      dataObj.name = categories[i]["name"];
      dataObj.score = Math.round(categories[i].score_out_of_10*10);
      dataArray1.push(dataObj);
    }
    return dataArray1;
  }

  function city2Data(categories) {
    let dataArray2 = [`${cityName2}`];
    for (let i = 0; i < categories.length; i++) {
      let dataObj = {};
      dataObj.name = categories[i]["name"];
      dataObj.score = Math.round(categories[i].score_out_of_10*10);
      dataArray2.push(dataObj);
    }
    return dataArray2;
  }

  function sortCity1(objArray) {
    $("#categoryNames1").html("");
    objArray.shift(objArray[0]);
    objArray.sort((obj1, obj2) => {
      if(obj1.score < obj2.score) {
        return 1;
      } else if (obj1.score > obj2.score) {
        return -1;
      }
      return 0;
    });
    for (let i = 0; i < objArray.length; i++) {
      $('#categoryNames1').append(`<tr class="catName1${i}"></tr>`);
      $(`.catName1${i}`).append(`<td>${objArray[i]["name"]}</td>`);
      $(`.catName1${i}`).append(`<td>Score: ${Math.round(objArray[i].score)}</td>`);
    }

    return objArray;
  }

  function sortCity2(objArray) {
    $("#categoryNames2").html("");
    objArray.shift(objArray[0]);
    objArray.sort((obj1, obj2) => {
      if(obj1.score < obj2.score) {
        return 1;
      } else if (obj1.score > obj2.score) {
        return -1;
      }
      return 0;
    });
    for (let i = 0; i < objArray.length; i++) {
      $('#categoryNames2').append(`<tr class="catName2${i}"></tr>`);
      $(`.catName2${i}`).append(`<td>${objArray[i]["name"]}</td>`);
      $(`.catName2${i}`).append(`<td>Score: ${Math.round(objArray[i].score)}</td>`);
    }

    return objArray;
  }
}


function capitalizeWords(str) {
  return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function createChartArray(scoreArray2, scoreArray1) {
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

$("#cityInputs").on("submit", cityData);

})();
