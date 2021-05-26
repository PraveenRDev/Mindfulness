/*
	Breathe	Bubble: App that interacts with the user visually
	Description: This app helps reduce anxiety and stress with proven breathe techniques.
				 This app will be developed as a browser extension in future, that can help users to visit distractive sites mindfully
	Creator: Praveen R
*/

window.onload = function () {
	// get dom elements
	const appContainer = document.getElementById("app-container");
	const guidance = document.getElementById("guidance-text");
	const breatheContainer = document.getElementById("breathe-container");
	const btnAction = document.getElementById("btn-action");
	const outerBubble = document.getElementById("outer-bubble");
	const statsModal = document.getElementById("statsModal");

	// timer variables
	let globalTimer, timer, breatheInOutTimer, holdTimer;

	// Array to hold info about each breathe session
	const statMsgs = [
		`Quiet your mind and ease your stress, Ideal for when you're feeling anxious,
		restless or overwhelmed`,
		`Improve your performance and sharpen concentration. Perfect preparation before important moments`,
		`Improve your core muscle stability, slow your breathing, and restore energy. Try this after a busy day.`,
	];

	// Object to store time
	const breatheTimer = {
		totalTime: 0,
		breatheTime: 0,
		holdTime: 0,
	};

	// Object to store the stats and configurations
	let stats = {
		mode: 1,
		modeName: "relax",
		isStart: false,
		breatheCycles: 0,
		totalTime: 0,
	};

	// reset stats info :- breatheCycles, totalTime
	const resetStats = () =>
		(stats = {
			...stats,
			breatheCycles: 0,
			totalTime: 0,
		});

	// show stats in a modal
	const showStats = () => {
		// show stats only when the user has completed at least 1 breathe cycle
		if (stats.breatheCycles >= 1) {
			// get the dom elements to variables
			const sessionName = document.getElementById("sessionName");
			const sessionDuration = document.getElementById("sessionDuration");
			const sessionCycles = document.getElementById("sessionCycles");
			const statMsg = document.getElementById("statMsg");
			const modelContent = document.getElementById("modelContent");

			// format seconds to minutes and seconds
			const formatTime = (seconds) => {
				// add zero to single digits
				const addZero = (time) => {
					return time >= 10 ? time : "0" + time;
				};
				// identify minutes and seconds and add zero if its a single digit
				let min = addZero(Math.floor((seconds % 3600) / 60));
				let sec = addZero(Math.floor((seconds % 3600) % 60));

				// format time in needed format
				return seconds < 60
					? `${sec} second${sec > 1 ? "s" : ""}`
					: seconds % 60 === 0
					? `${min} minute${min > 1 ? "s" : ""}`
					: `${min} minute${min > 1 ? "s" : ""} and ${sec} second${
							sec > 1 ? "s" : ""
					  }`;
			};

			// change modal color
			modelContent.style.backgroundColor =
				stats.mode === 1 ? "#3d9ef8" : stats.mode === 2 ? "#f83d75" : "#0c8046";

			// show modal
			statsModal.style.display = "block";

			// show appropriate info (values/messages) in the dom
			sessionName.textContent =
				stats.modeName.charAt(0).toUpperCase() + stats.modeName.slice(1);
			sessionDuration.textContent = formatTime(stats.totalTime);
			sessionCycles.textContent = `${stats.breatheCycles} cycle${
				stats.breatheCycles > 1 ? "s" : ""
			}`;
			statMsg.textContent = statMsgs[stats.mode - 1];
		}
		// if the user hasn't completed a breathe cycle, reset the stats
		else {
			resetStats();
		}
	};

	// set breathTime
	const setBreatheTimer = (totalTime = 10000) => {
		// set the time for one complete breathe cycle
		breatheTimer.totalTime = totalTime;

		/* change breathe in out time according the current breathe mode
				relax -> 4 seconds breathe-in,breathe-out 
				focus -> 4.5 seconds breathe-in,breathe-out
				restore -> 3.5 seconds breathe-in,breathe-out
		*/
		const breatheTimeMultipler =
			stats.mode === 1 ? 4 : stats.mode === 2 ? 4.5 : 3.5;

		/* change hold time according the current breathe mode
				relax -> 2 seconds hold 
				focus -> 1 seconds hold
				restore -> 3 seconds hold
		*/
		const holdTimeMultiplier = stats.mode === 1 ? 2 : stats.mode === 2 ? 1 : 3;

		// convert the seconds to milli-seconds and store them to use in timers
		breatheTimer.breatheTime = 1000 * breatheTimeMultipler;
		breatheTimer.holdTime = 1000 * holdTimeMultiplier;
	};

	// function to start breathing
	const startBreathing = (isFirstCall = false) => {
		// change guidance text to breathe in
		guidance.innerText = "Breathe In!";
		// show visual animation to expand the breathe
		appContainer.className = `app-container grow ${stats.modeName}`;
		// show visual animation to rotate the bubble
		breatheContainer.className = "breathe-container rotate";

		// start breathin & breathout timer according to the breathe time
		breatheInOutTimer = setTimeout(() => {
			// when breathin is done running show guidance text as Hold
			guidance.innerText = "Hold";
			// start hold timer according to the hold time
			holdTimer = setTimeout(() => {
				// when hold time is done, show guidance text as Breathe Out
				guidance.innerText = "Breathe Out!";
				// show visual animation to shrink the bubble
				appContainer.className = `app-container shrink ${stats.modeName}`;
			}, breatheTimer.holdTime);
		}, breatheTimer.breatheTime);
		// check if its not the first breathe cycle
		if (!isFirstCall) {
			// count the breathe cycles
			stats.breatheCycles += 1;
		}
	};

	// function to handle stop breathing
	const stopBreathing = (defaultStop = true) => {
		// clear breathe timer
		clearInterval(timer);
		// clear global breathe cycle timer
		clearInterval(globalTimer);
		// clear breathe In Out timer
		clearTimeout(breatheInOutTimer);
		// clear hold timer
		clearTimeout(holdTimer);
		// remove guidance text
		guidance.innerText = "";
		// stop animations
		breatheContainer.className = "breathe-container stop-animation";
		appContainer.className = "app-container stop-animation";

		// if app is stop/ended by default behavior and not by switching pages
		if (defaultStop) {
			// show meditation stats
			showStats();
		}
	};

	// handle action button click
	const handleActionBtn = () => {
		// update isStart, if its previously false change it to true and vice versa
		stats.isStart = stats.isStart ? false : true;
		// if action button is start
		if (stats.isStart) {
			// start global timer
			globalTimer = setInterval(() => stats.totalTime++, 1000);
			// change button text to end
			btnAction.textContent = "End";
			// set total (breathe) time per cycle
			setBreatheTimer(10000);
			// call start breathing to run soon after the click
			startBreathing(true);
			// start the breathe cycle and timer according to the total (breathe) time
			timer = setInterval(startBreathing, breatheTimer.totalTime);
		}
		// if action button is end
		else {
			// change action button text as start
			btnAction.textContent = "Start";
			// stop breathing
			stopBreathing();
		}
	};

	const setPage = () => {
		// dynamicall set the styling for pages based on the current modeName/page
		document.body.className = `${stats.modeName}-bg`;
		outerBubble.className = `outer-bubble ${stats.modeName}`;
	};

	// logic to handle radio button change
	const handleModeChange = (mode) => {
		// if app is in start state
		if (stats.isStart) {
			// stop the breathing
			stopBreathing(false);
			// reset the stats information
			resetStats();
			// change action button text as start
			btnAction.textContent = "Start";
			// change isStart to false to change the state of the running app
			stats.isStart = false;
		}
		// store the current mode to identify what mode we are in
		stats.mode = Number(mode);
		// determine the radio value and set the modeName
		if (mode === "1") {
			stats.modeName = "relax";
		} else if (mode === "2") {
			stats.modeName = "focus";
		} else if (mode === "3") {
			stats.modeName = "restore";
		}
		// call setPage to handle logic for each page
		setPage();
	};

	const handleModalOutsideClick = (event) => {
		// if the user clicks outside of the modal, close the modal
		if (event.target == statsModal) {
			// close model
			statsModal.style.display = "none";
			// reset the stats information
			resetStats();
		}
	};

	// add click listener to radio buttons
	document.getElementsByName("breathe-mode").forEach(
		// for each click on radio button change mode
		(mode) => (mode.onclick = (e) => handleModeChange(e.target.value))
	);

	// call handleModalOutsideClick when a click is made on the window
	window.onclick = handleModalOutsideClick;

	// call handleActionBtn when action button is clicked
	btnAction.onclick = handleActionBtn;
};
