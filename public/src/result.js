import http from 'axios';
import Chartist from 'chartist';
import ChartistTooltip from 'chartist-plugin-tooltips';
import countBy from 'lodash/countBy';
import fill from 'lodash/fill';
import keys from 'lodash/keys';
import values from 'lodash/values';
import map from 'lodash/map';
import orderBy from 'lodash/orderBy';
import queryString from 'query-string';
import 'chartist-plugin-tooltips/dist/chartist-plugin-tooltip.css';
import 'chartist/dist/scss/chartist.scss'; //Add colors manually :(
import './chartist.scss';
import './theme.scss';

var VOTESNUM;

document.addEventListener('DOMContentLoaded', function () {

	http.get('http://rankings.danielgrants.com/api/stageweek').then((response) =>{
		let query = queryString.parse(location.search);
		let prev = `/result?stage=${query.stage}&week=${+query.week-1}`, next = `/result?stage=${query.stage}&week=${+query.week+1}`;
		if(query.week === 1){
			prev = `/result?stage=${+query.stage-1}&week=5`;
		}
		if(query.week === 5){
			next = `/result?stage=${+query.stage+1}&week=1`;
		}
		if(query.stage == 3 && query.week == 1)
		{
			prev = '';
		}
		if(query.stage == response.data.stage && query.week == response.data.week)
		{
			next = '';
		}
		document.getElementById('stageweek').innerHTML = `<div class="header-flex">
			<a href="${prev ? prev : '#'}" class="${prev ? '': 'disabled'}">< Previous</a>
			<p id="stageweek">Stage ${query.stage} Week ${query.week}</p>
			<a href="${next ? next : '#'}" class="${next ? '': 'disabled'}">Next ></a>
		</div>`;
	});

	http.get('http://rankings.danielgrants.com/api/votes'+location.search).then((response) => {

		VOTESNUM = response.data.length;

		if(VOTESNUM >= 0){
			window.location.replace("/result_error");
		}

		let toid = { "BOS": 0, "DAL": 1, "FLA": 2, "HOU": 3, "LDN": 4, "GLA": 5, "VAL": 6, "NYE": 7, "PHI": 8, "SFS": 9, "SEO": 10, "SHD": 11 };
		let teamranks = [
			{ name: '1', data: fill(Array(12), 0) },
			{ name: '2', data: fill(Array(12), 0) },
			{ name: '3', data: fill(Array(12), 0) },
			{ name: '4', data: fill(Array(12), 0) },
			{ name: '5', data: fill(Array(12), 0) },
			{ name: '6', data: fill(Array(12), 0) },
			{ name: '7', data: fill(Array(12), 0) },
			{ name: '8', data: fill(Array(12), 0) },
			{ name: '9', data: fill(Array(12), 0) },
			{ name: '10', data: fill(Array(12), 0) },
			{ name: '11', data: fill(Array(12), 0) },
			{ name: '12', data: fill(Array(12), 0) }
		];

		response.data.forEach((vote) => {
			vote.teams.forEach((team, index) => {
				if (!teamranks[11 - index].data[toid[team]]) teamranks[11 - index].data[toid[team]] = 0;
				teamranks[11 - index].data[toid[team]]++;
			})
		});

		let baroptions = {
			axisX: { showLabel: false },
			stackBars: true,
			horizontalBars: true,
			reverseData: true,
			seriesBarDistance: 50,
			plugins: [Chartist.plugins.tooltip({ currency: 'votes: ' })]
		};
		new Chartist.Bar('#team-chart', { labels: keys(toid), series: teamranks }, baroptions)
			.on('draw', function (context) {
				if (context.type === 'bar') {
					if (context.value.x / VOTESNUM > 0.0133) {
						context.element.root().elem('text', {
							x: context.x1 + 8, 
							y: context.y2 - 4 //font-size / 2
						}, 'ct-bar-label').text(context.series.name);
					}
				}
			});

		let pieoptions = {
			chartPadding: 40,
			labelPosition: 'outside',
			labelOffset: 25,
			plugins: [Chartist.plugins.tooltip({ currency: 'votes: ' })]
		};
		new Chartist.Pie('#offense-chart', toChartistMVP(response.data, 'offense'),
			Object.assign(pieoptions, { labelInterpolationFnc: transformLabel(response.data, 'offense') }));
		new Chartist.Pie('#tank-chart', toChartistMVP(response.data, 'tank'),
			Object.assign(pieoptions, { labelInterpolationFnc: transformLabel(response.data, 'tank') }));
		new Chartist.Pie('#flex-chart', toChartistMVP(response.data, 'flex'),
			Object.assign(pieoptions, { labelInterpolationFnc: transformLabel(response.data, 'flex') }));
		new Chartist.Pie('#support-chart', toChartistMVP(response.data, 'support'),
			Object.assign(pieoptions, { labelInterpolationFnc: transformLabel(response.data, 'support') }));

		document.getElementById('container').classList.remove('loading');
	});
});

function transformLabel(data, position) {
	data = toChartistMVP(data, position);
	return function (label, index) {
		return data.series[index].value / VOTESNUM > 0.0133 ? label : '';
	}
}

function toChartistMVP(data, position) {
	data = countBy(data, position);
	data = map(data, (value, key) => {
		return { name: key, value: { meta: key, value: value } };
	});
	data = orderBy(data, 'value.value', 'desc');
	return {
		labels: map(data, 'name'),
		series: map(data, 'value'),
	};
}