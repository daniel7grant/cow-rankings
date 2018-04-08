const moment = require('moment');

var stageweek = {
   	14 : { stage : 3, week : 1 },
   	15 : { stage : 3, week : 2 },
   	16 : { stage : 3, week : 3 },
   	17 : { stage : 3, week : 4 },
   	18 : { stage : 3, week : 5 },
   	19 : { stage : 3, week : 5 },
   	20 : { stage : 4, week : 1 },
   	21 : { stage : 4, week : 2 },
   	22 : { stage : 4, week : 3 },
   	23 : { stage : 4, week : 4 },
   	24 : { stage : 4, week : 5 },
}

module.exports = function(){
	return stageweek[moment().add(-4, "days").week()]; //Start new week every Wed
};
