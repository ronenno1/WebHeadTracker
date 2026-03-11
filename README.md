# 🧠 WebHeadTracker

**WebHeadTracker** is a web-based platform designed to measure head movements in real time using a standard webcam.  
It includes a nod–shake Stroop task, in which participants respond to the color of the words by nodding or shaking their heads while ignoring the word meaning. This task allows researchers to examine stimulus–response compatibility effects and the temporal dynamics of head-movement responses in an online environment.

---

## 🎯 Overview

This project provides an accessible, browser-based tool to record and analyze head movements during cognitive tasks.
The platform implements a nod–shake Stroop paradigm, in which participants respond to stimulus color by nodding or shaking their heads while ignoring the word meaning. The system uses the same head-movement detection algorithm throughout the task, enabling precise measurement of the temporal dynamics of nodding and shaking responses.

---

## 🚀 Try the Task

| Task | Description | Live Link | View Code |
|------|-------------|-----------|-----------|
| 🤖 **Nod–Shake Stroop Task** | Participants respond to the **color** of the words “YES” and “NO” by **nodding or shaking their heads** while ignoring the word meaning. The task measures the temporal dynamics of head movements and stimulus–response compatibility effects. | [Start Task](https://ronenno1.github.io/WebHeadTracker/task.html) | [View Code](https://github.com/ronenno1/WebHeadTracker/blob/main/nod_shake_stroop.js) |
---


## 💻 Running the Experiment

This platform is built using the **Minno** framework for online behavioral experiments — see the official documentation here: https://minnojs.github.io/




To run the experiment, **three main files** are required:

1. **Manager file:** `runner.js` – responsible for launching and controlling the experiment flow.  
2. **Experiment file:** `nod_shake_stroop.js` – implements the nod–shake Stroop task and defines the stimuli and trial structure.  
3. **Head-tracking module:** `minno_mesh.js` – performs the head-movement detection using FaceMesh and MediaPipe.

4. 
### Manager File Setup

In addition to defining the sequence of tasks for data collection, the following **basic setups** are required:

**1. Loading required packages**

```javascript
// Eye blink tracking
import 'minno_mesh.js';

// MediaPipe packages
import 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';
import 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js';

// Optional: Datapipe for OSF data saving
import 'https://cdn.jsdelivr.net/gh/minnojs/minno-datapipe@1.*/datapipe.min.js';

```

**2. Datapipe initialization (if required)**


Datapipe is a platform that supports automatic data upload to the **Open Science Framework (OSF)** using **DataPipe**, an open-source service for securely archiving behavioral experiment data in real time.  
If enabled, each completed session is packaged as a JSON or a CSV file and sent directly from the browser to a linked OSF project via the DataPipe API.  
Learn more here: https://pipe.jspsych.org


```javascript
init_data_pipe(API, 'UAckahgsCaWH', { file_type:'csv' });
// Replace 'UAckahgsCaWH' with your own Datapipe project hashcode
```

**3. Initialize Minno Mesh**
```javascript
global.init_minno_mesh = init_minno_mesh;
```

**4. Uploading task at the end of the experiment (if using Datapipe)**

Because data are uploaded to **OSF** using **DataPipe**, the upload process may take a few moments depending on the participant’s internet connection.  
To ensure that all files are successfully transferred, the platform includes an **uploading step** at the end of the task. During this step, participants are shown a **“please wait”** notification while the data are being sent to OSF.

This waiting screen is essential, as it prevents participants from closing the browser before the upload completes.  
More details about implementing an upload-waiting mechanism can be found in the 
[Minno documentation](https://minnojs.github.io/blog/2023/11/01/running-project-implicits-iat-on-your-own/#waiting-for-the-data-recording).















```javascript
uploading: uploading_task({
    title: 'Data Upload in Progress',
    header: 'Data Upload in Progress',
    body: 'Please wait while your data is securely uploaded to the server. You can exit the experiment once the upload is complete.',
    buttonText: 'Exit the Experiment'
});
// Call this task at the end:
{ inherit: 'uploading' }

```

### Experiment File Setup (`nod_shake_stroop.js`)

**1. Initialize Minno Mesh at the beginning of the experiment**
```javascript
global.init_minno_mesh(global); // Loads minno_faces components
```

**Start recording at the beginning of each trial**
```javascript
{
    conditions: [{ type:'begin' }],
    actions: [
        { type:'custom', fn: function() { global.start_recording(global); } }
    ]
}
```


**3. End of trial: collect eye blink data**
```javascript
            {
                conditions: [{type:'inputEquals', value:'feedback1'}],
                actions: [
                    {type:'hideStim', handle:['All']},
				    {type:'setInput', input:{handle:'y', on: 'keypressed', key: 'Y'}},
				    {type:'setInput', input:{handle:'n', on: 'keypressed', key: 'N'}},
				    {type:'setInput', input:{handle:'e', on: 'keypressed', key: 'E'}},
				    {type:'setTrialAttr',setter:function(trialData, eventData){
                        trialData.HM           = global.get_all(global);
                        trialData.HM_validity  = global.get_validity(global);
                        trialData.answer        = global.get_answer(global);
                     
                        if (global.current.trial_id<10){
                            global.current.trial_id++; 
                            global.current.HM_invalidity = global.current.HM_invalidity+(1-(trialData.HM_validity>0.5));
                        }
                    }},
                    {type:'custom',fn: function(){global.stop_recording(global);}},

                    {type:'log'},

                ]
            },
```
### Notes

- `global.get_all` → gets complete head movements information, including timestamps.  
- `global.get_validity` → returns the number of valid samples detected during the trial.
- `global.get_answer` → returns the exact answer ("yes" or "no").  

- Recording stops at the end of the trial and restarts in the next trial as needed.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

### 👤 Author

Developed by *Ronen Hershman*  
📧 Contact: [ronen.hershman@uibk.ac.at]


