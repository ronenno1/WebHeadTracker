define(['managerAPI', 'minno_mesh.js', 'https://cdn.jsdelivr.net/gh/minnojs/minno-datapipe@1.*/datapipe.min.js'], function (Manager, minno_mesh) {

	var API         = new Manager();

     // ---- MediaPipe loader: prevent RequireJS "mismatched anonymous define" ----
    // Key idea: MediaPipe's WASM glue sometimes registers an *anonymous* AMD module.
    // In a RequireJS page (Minno), that can crash on the second init.
    // Fix: remove the AMD marker (define.amd) once, permanently, before MediaPipe/WASM runs.
    if (window.define && window.define.amd) {
      try {
        delete window.define.amd;
      } catch (e) {
        window.define.amd = undefined;
      }
    }
    
    // Load external scripts once (plain script tags, not RequireJS).
    function loadScriptOnce(url) {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${url}"]`)) return resolve();
        const s = document.createElement('script');
        s.src = url;
        s.async = true;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }
    
    // Promise that resolves once MediaPipe is available on window.
    if (!window.MEDIAPIPE_READY) {
      window.MEDIAPIPE_READY = (async () => {
        await loadScriptOnce('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
        await loadScriptOnce('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js');
        if (!window.FaceMesh) throw new Error('MediaPipe loaded but window.FaceMesh is missing.');
      })();
    }
    var instStyle   = "font-size:20px; text-align:middle;  margin-right:10px; font-family:arial";
    var global      = API.getGlobal(); 
	init_data_pipe(API, 'UAckahgsCaWH',  {file_type:'csv'});	

    global.init_minno_mesh  = init_minno_mesh;

    var noticeInst = 'At the top, you can see what your webcam shows.<br>' + 
        'Your head must be in the middle of the square for our software to detect you properly.<br>' + 
        'If the frame is green, your head is well detected. If the frame is red, there is a problem detecting your head movements.<br>' + 
        'Please ensure that only one person <b>(you)</b> is in front of the screen during the experiment.<br>';
    

    var MainIns_m = '<p>Your task is to move your head as quickly as possible in response to the displayed colors.<br></p>' +
                    '<p>If the <b>color</b> is <b><span style="color: blue;">blue</span></b>, move your head as if you are saying <b>YES</b> (up and down).</p>' +
                    '<p>If the <b>color</b> is <b><span style="color: orange;">orange</span></b>, move your head as if you are saying <b>NO</b> (left and right).</p>' +
                    '<p style="font-weight: bold;">Please keep looking at the center of the screen throughout the experiment.</p><br>' +
                    '<br/>' + 
                    noticeInst;
    var reStartIns =  '<p>The practice was not completed properly<br></p>' +
                    '<p>Remember: Your task is to move your head as quickly as possible in response to the displayed colors.<br></p>' +
                    '<p>If the <b>color</b> is <b><span style="color: blue;">blue</span></b>, move your head as if you are saying <b>YES</b> (up and down).</p>' +
                    '<p>If the <b>color</b> is <b><span style="color: orange;">orange</span></b>, move your head as if you are saying <b>NO</b> (left and right).</p>' +
                    '<p style="font-weight: bold;">Please keep looking at the center of the screen throughout the experiment.</p><br>' +
                    '<br/>' + 
                    noticeInst;

    var StartIns =  '<p>The practice was successfully completed!<br></p>' +
                    '<p>Remember: Your task is to move your head as quickly as possible in response to the displayed colors.<br></p>' +
                    '<p>If the <b>color</b> is <b><span style="color: blue;">blue</span></b>, move your head as if you are saying <b>YES</b> (up and down).</p>' +
                    '<p>If the <b>color</b> is <b><span style="color: orange;">orange</span></b>, move your head as if you are saying <b>NO</b> (left and right).</p>' +
                    '<p style="font-weight: bold;">Please keep looking at the center of the screen throughout the experiment.</p><br>' +
                    '<br/>' + 
                    noticeInst;

    var MainInst = '<p>Remember: Your task is to move your head as quickly as possible in response to the displayed colors.<br></p>' +
                    '<p>If the <b>color</b> is <b><span style="color: blue;">blue</span></b>, move your head as if you are saying <b>YES</b> (up and down).</p>' +
                    '<p>If the <b>color</b> is <b><span style="color: orange;">orange</span></b>, move your head as if you are saying <b>NO</b> (left and right).</p>' +
                    '<p style="font-weight: bold;">Please keep looking at the center of the screen throughout the experiment.</p><br>'+
                    '<br/>' + 
                    noticeInst ;

	API.addTasksSet(
	{
        consent: [{
            type: 'message',

            name: 'consent',
            templateUrl: 'consent.jst',
            title: 'Exp'
        }],
        commit: [{
            type: 'message',
            buttonText: 'continue',
            name: 'commit',
            templateUrl: 'commit.jst',
            title: 'Commit'
        }],
	    subject : 
		[{
			type: 'quest', piTemplate: true, name: 'subject', scriptUrl: 'subject.js'
		}],
        uploading: uploading_task({title: 'Data Upload in Progress', header: 'Data Upload in Progress', body:'Please wait while your data is securely uploaded to the server. You can exit the experiment once the upload is complete.', buttonText: 'Exit the Experiment'}),

		nod_shake_stroop :
		[{
			type: 'time', name: 'nod_shake_stroop', scriptUrl: 'nod_shake_stroop.js' , 
			current: {
			    myID:'vis_task',
			    maxTimeoutsInBlock:8,
			    maxFailedBlocks:2,
			    num_of_prac_trials:10,      // 3
                minScore4exp: 8,            // 0
			    num_of_trials:3,            // 80X3=240
			    blockInst: [
			            
    	            '<div style="'+instStyle+'"><color="red">' +
                            MainIns_m+ 
                        '<p><mark><strong>If you cannot see your head above, it likely indicates that we are unable to detect your head movements. Please try refreshing the page to restart the experiment. If we still cannot detect your head movements correctly, the experiment will be unable to proceed.</strong></mark></p>'+    
                        '<p>Please press the spacebar to continue</p>'+ 
                    '</div>',
		        ////////////////////////////////////////////////////////

 	             '<div style="'+instStyle+'"><color="red">' +
                            reStartIns+ 
                        '<p>Please press the spacebar to continue</p>'+ 
                    '</div>',
   
			        ////////////////////////////////////////////////////////

 	             '<div style="'+instStyle+'"><color="red">' +
                            StartIns+ 
                        '<p>Please press the spacebar to continue</p>'+ 
                    '</div>',
   
			        ////////////////////////////////////////////////////////
		            '<div style="'+instStyle+'"><color="#000000">' +
		                '<p><b>A short break.</b></p>'+ 
                        '<p>Please press the spacebar to continue.</p>'+
                    '</div>',
			        ////////////////////////////////////////////////////////

    	            '<div style="'+instStyle+'"><color="red">' +
                            MainInst+ 
                        '<p>Please press the spacebar to continue</p>'+ 
                    '</div>',
			            
			        ////////////////////////////////////////////////////////
   		            '<div style="'+instStyle+'"><color="#000000">' +
		                '<p><b>This part of the experiment is done.</b></p>'+ 
                        '<p>Please press the spacebar to continue.</p>'+
                    '</div>',
			        ////////////////////////////////////////////////////////

                   '<div style="'+instStyle+'"><color="#000000">' +
		                '<p><b>Unfortunately, it was not possible to detect your head movements properly. </br>Hence, the experiment could not be continue.</b></p>'+ 
                        '<p>Please press the spacebar to exit.</p>'+
                    '</div>'


		        ]
			}
		}]
	});

    //define the sequence of the study
    API.addSequence([
        // {inherit: 'consent'},
        // {inherit: 'commit'},
        // {inherit: 'subject'},
        {inherit: 'nod_shake_stroop'},
        {inherit: 'uploading'}
	]);
	return API.script;
});
