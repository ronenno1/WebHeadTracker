define(['timeAPI','underscore'], function(APIconstructor, _) {
    //document.body.style.cursor='none';

    var API     = new APIconstructor();
    // API.addSettings('rtl', true);
    var global  = API.getGlobal();
    var current = API.getCurrent();
    var height = window.screen.height*0.2;
    global.init_minno_mesh(global); // This function load minno_faces components
    global.current.HM_invalidity   = 0;
    global.current.score            = 0;
    global.current.trial_id         = 0;
    global.current.invalid          = 0;
    global.exit                     = 0;
    var defaultObj = {
        instStyle :  "font-size:24px; text-align:center; margin-left:10px; color:#000000; margin-right:10px; font-family:arial",
        
    	baseURL : '',
        times: {
            fixation_duration : 400,
            stimulus_duration : 100,
            feedback_duration : 1500,
            iti_duration      : 2000
        },
        maxTimeoutsInBlock    : 5, 
        maxFailedBlocks       : 2,
        timeouts              : 0, 
        failedBlocks          : 0,
        canvas : {
            textSize         : 5,
            maxWidth         : 1200,
            proportions      : 0.65,
            cursor           : 'none',
            borderWidth      : 0.1,
            background       : '#FFFFFF',
            canvasBackground : '#FFFFFF'	
        }
    };

	_.defaults(current, defaultObj);

    API.addSettings('canvas', current.canvas);

    API.addSettings('base_url',{
        image : current.baseURL
    });

    /***********************************************
    // Media
     ***********************************************/
     
    /*
        group1MediaSets is an object with all the media sets that will considered group1. 
        We will create a media set (group1Media) that is comprised of media that inherit exRandomly from each media set. 
        Then, when we inherit exRandomly from that set, we will get one from mediaSet before getting another one from any of 
        the other mediaSets. This will allow us to present an equal number of photos from each mediaSet in each group.
    */ 

	//console.log('after media');
    /***********************************************
    // Stimuli
     ***********************************************/
    API.addStimulusSets({
        defaultStim    : [{css:{cursor:'none', color:'#000000', 'font-size':'2.5em'}, nolog:true}],
        fixation       : [{inherit:'defaultStim', media: '+', handle:'fixation'}],
        error          : [{inherit:'defaultStim', media: {html: '<span style="color: red;">Failed to detect response!</span>'}, handle:'error'}],
        yes_correct : [{inherit:'defaultStim', media: {html: '<span style="color: green;">Correct response:</span> <br>YES was detected!'}, handle:'yes_correct'}], 
        yes_incorrect : [{inherit:'defaultStim', media: {html: '<span style="color: red;">Incorrect response:</span> <br>YES was detected!'}, handle:'yes_incorrect'}], 

        no_correct : [{inherit:'defaultStim', media: {html: '<span style="color: green;">Correct response:</span> <br> NO was detected!'}, handle:'no_correct'}], 
        no_incorrect : [{inherit:'defaultStim', media: {html: '<span style="color: red;">Incorrect response:</span> <br> NO was detected!'}, handle:'no_incorrect'}], 

        timeoutmessage : [{inherit:'defaultStim', media: 'Respond faster!', handle:'timeoutmessage'}], 
        reminder : [{inherit:'defaultStim', media: '<%=trialData.reminder%>', css:{color:'blue', cursor:'none', 'font-size':'1em'}, location:{bottom:1}, handle:'reminder'}], 
        faceStim : {css:{ cursor:'none'}, handle:'target'}
    });

 
    API.addTrialSets('silentStart',
    {
	    data:{onFail:true},
	    interactions: [
			{ // begin trial
				conditions: [{type:'begin'}],
				actions: [
                    {type:'custom',fn: function(){
                        //global.maximize();
                    }},
				    {type:'endTrial'}
				]
			}
		]
    });
    API.addTrialSets('silentEnd',
    {
	    data:{onFail:true},
	    interactions: [
			{ // begin trial
				conditions: [{type:'begin'}],
				actions: [
                    {type:'custom',fn: function(){
                        global.stopVideo(global);
                    }},
				    {type:'endTrial'}
				]
			}
		]
    });

	//console.log('after failure trials');
    /***********************************************
    // INSTRUCTIONS TRIAL
     ***********************************************/    

	//Define the instructions trial
	API.addTrialSets('inst',{
	    data : {block:0},
		input: [
			{handle:'space',on:'space'} //Will handle a SPACEBAR response

		],
		interactions: [
			{ // begin trial
				conditions: [{type:'begin'}],
				actions: [{type:'showStim',handle:'All'}] //Show the instructions
			},
			{
				conditions: [{type:'inputEquals',value:'space'}], //What to do when space is pressed
				actions: [
					{type:'hideStim',handle:'All'}, //Hide the instructions
					{type:'setInput',input:{handle:'endTrial', on:'timeout',duration:500}} //In 500ms: end the trial. In the mean time, we get a blank screen.
				]
			},
			{
				conditions: [{type:'inputEquals',value:'endTrial'}], //What to do when endTrial is called.
				actions: [
					{type:'endTrial'} //End the trial
				]
			}
		]
	});

	//console.log('after inst trials');
    /***********************************************
    // Main trials
     ***********************************************/

    API.addTrialSets('endOfPractice',{
        input: [ 
			{handle:'end', on: 'timeout', duration: 0}
        ],
        interactions: [
            {
                conditions: [
                    {type:'custom',fn: function(){return global.current.score<global.current.minScore4exp;}}
                ],
                actions: [

                    {type:'custom',fn: function(){global.current.score=0;}},
                    {type:'endTrial'}				
                ]
            },  
            {
                conditions: [ 
                    {type:'custom',fn: function(){return global.current.score>=global.current.minScore4exp;}}
                ],
                actions: [
                    {type:'custom',fn: function(){global.current.score=0;}},
                    {type:'goto',destination: 'nextWhere', properties: {exp:true}},
                    {type:'endTrial'}				
                ]
            }
        ]
    });


    API.addTrialSets('exit',{
        input: [ 
			{handle:'end', on: 'timeout', duration: 0}
        ],
        interactions: [
            {
                conditions: [
                    {type:'custom',fn: function(){return true;}}
                ],
                actions: [
                    {type:'custom',fn: function(){console.log('exit');}},

                    {type:'goto',destination: 'nextWhere', properties: {task_over:true}},
                    {type:'endTrial'}				
                ]
            }
        ]
    });

    API.addTrialSets('next_one',{
        input: [ 
			{handle:'end', on: 'timeout', duration: 0}
        ],
        interactions: [
            {
                conditions: [


                    {type:'custom',fn: function(){return true;}}
                ],
                actions: [

                    {type:'endTrial'}				
                ]
            }
        ]
    });
    API.addTrialSets('startPracticeAgain',{
        input: [ 
			{handle:'end', on: 'timeout', duration: 0}
        ],
        interactions: [
            {
                conditions: [
                {type:'custom',fn: function(){return true;}}
                ],
                actions: [
                    {type:'goto',destination: 'previousWhere', properties: {practice:true}},
                    {type:'endTrial'}				
                ]
            }
        ]
    });
    

    API.addTrialSets('startPractice',{
        input: [
            {handle:'end', on: 'timeout', duration: 0}
        ],
        interactions: [
            {
                conditions: [
                    {type:'custom',fn: function(){return true;}}
                ],
                actions: [
                    {type:'custom',fn: function(){global.current.score=0;}},
                    {type:'endTrial'}                
                ]
            }
        ]
    });


    API.addTrialSets('main',[{ 
        data: {score:0},
        layout: [{inherit:'reminder'}],
		input: [
			{handle:'skip1',on:'keypressed', key:27} //Esc + Enter will skip blocks
		],
        interactions: [
            { 
                conditions: [{type:'begin'}],
                actions: [
                    {type:'custom',fn: function(){global.start_recording(global);}},
                    {type:'showStim', handle:'fixation'},
                    {type:'trigger', handle:'showTarget', duration: '<%= global.current.times.fixation_duration %>'}

                ]
            }, 

            {
                conditions:[{type:'inputEquals',value:'showTarget'}],
                actions: [
                    {type:'hideStim', handle:'fixation'}, 
				    {type:'showStim', handle: 'target'},

				    {type:'setInput', input:{handle:'space',on:'space'}},
                    {type:'resetTimer'},
                    // {type:'custom', fn: function(a, b, trial){return current.start_time = Date.now();}},

                    
                    {type:'trigger',handle:'timeout', duration: '<%= global.current.times.fixation_duration %>'}
                ]
            },
           
           
           {
                conditions:[{type:'inputEquals',value:'remove_target'}],
                actions: [
                    {type:'hideStim', handle:'target'}, 
                    {type:'trigger',handle:'timeout', duration:'<%= global.current.times.stimulus_duration %>'}
                ]
            },
            
           
         

           
            {
                conditions: [
                    {type:'inputEquals',value:'timeout'},
                ],
                actions: [
                    {type:'removeInput', handle:['All']},
                    {type:'hideStim', handle:['All']},

                    {type:'setTrialAttr', setter:{score:-1}},
                    // {type:'custom', fn: function(a, b, trial){return trial.data.RT = Date.now()-current.start_time;}},
                    {type:'log'},

                    {type:'custom',fn: function(){
                        current.timeouts++;
                    }},
                    {type:'trigger', handle:'ITI'}

                ]
            },
            
           {
                conditions: [{type:'inputEquals', value:'ITI'}],
                actions:[
                    {type:'removeInput', handle:['All']},
                    {type:'hideStim', handle:['All']},

                    {type:'trigger', handle:'feedback1',duration:'<%= global.current.times.iti_duration %>'}
                ]
            },


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

            {
                conditions: [
                    {type:'inputEqualsTrial', property:'correctKey'},
                    {type:'inputEquals', value:'y'}],
                actions: [
                    {type:'setTrialAttr', setter:{score:1}},
                    {type:'custom',fn: function(){global.current.score++;}},

                    {type:'showStim', handle:'yes_correct'},
                    {type:'removeInput', handle:['All']},

                    {type:'trigger', handle:'end', duration: '<%= global.current.times.feedback_duration %>'}
                ]
            }, 
            {
                conditions: [
                    {type:'inputEqualsTrial', property:'correctKey', negate:true},
                    {type:'inputEquals', value:'y'}],
                actions: [
                    {type:'setTrialAttr', setter:{score:0}},
                    {type:'showStim', handle:'yes_incorrect'},
                    {type:'removeInput', handle:['All']},

                    {type:'trigger', handle:'end', duration: '<%= global.current.times.feedback_duration %>'}
                ]
            }, 



            {
                conditions: [
                    {type:'inputEqualsTrial', property:'correctKey'},
                    {type:'inputEquals', value:'n'}],
                actions: [
                    {type:'setTrialAttr', setter:{score:1}},
                    {type:'custom',fn: function(){global.current.score++;}},

                    {type:'showStim', handle:'no_correct'},
                    {type:'removeInput', handle:['All']},

                    {type:'trigger', handle:'end', duration: '<%= global.current.times.feedback_duration %>'}
                ]
            }, 
            {
                conditions: [
                    {type:'inputEqualsTrial', property:'correctKey', negate:true},
                    {type:'inputEquals', value:'n'}],
                actions: [
                    {type:'setTrialAttr', setter:{score:0}},

                    {type:'showStim', handle:'no_incorrect'},
                    {type:'removeInput', handle:['All']},

                    {type:'trigger', handle:'end', duration: '<%= global.current.times.feedback_duration %>'}
                ]
            }, 


           
            {
                conditions: [{type:'inputEquals', value:'e'}],
                actions: [
                    {type:'setTrialAttr', setter:{score:0}},
                    {type:'showStim', handle:'error'},
                    {type:'removeInput', handle:['All']},

                    {type:'trigger', handle:'end', duration: '<%= global.current.times.feedback_duration %>'}
                ]
            }, 

            {
                conditions: [{type:'inputEquals', value:'end'}],
                actions: [
                    {type:'hideStim', handle:['All']},

                    {type:'log'},
                    {type:'endTrial'}
                ]
            },
			// skip block
			{
				conditions: [{type:'inputEquals',value:'skip1'}],
				actions: [
					{type:'setInput',input:{handle:'skip2', on:'enter'}} // allow skipping if next key is enter.
				]
			},
			// skip block
			{
				conditions: [{type:'inputEquals',value:'skip2'}],
				actions: [
					{type:'goto', destination: 'nextWhere', properties: {blockStart:true}},
					{type:'endTrial'}
				]
			}
        ],
        stimuli : [
            {inherit:'error'},
            {inherit:'yes_correct'},
            {inherit:'yes_incorrect'},
            {inherit:'no_correct'},
            {inherit:'no_incorrect'},
            
            {inherit:'timeoutmessage'},
            {inherit:'fixation'}
        ]
    }]);

	//console.log('after main trial');

    /***********************************************
    // Specific trials
     ***********************************************/
    API.addTrialSet('stimulus_trial', {
        inherit: {set:'main', merge:['stimuli']},
        stimuli: [
            { media: '<%= trialData.media %>', css:{cursor:'none', color: '<%= trialData.color %>', 'font-size':'200px'}, handle:'target', data:{correctKey:'<%= trialData.correct %>'}}
        ]
    });


    var cong_trials = [];
    var incong_trials = [];
    // var neutral_trials = [];

    cong_trials.push({inherit: 'stimulus_trial', data: {condition: 'congruent', media: 'YES', color:'blue', correctKey:'y'}});
    cong_trials.push({inherit: 'stimulus_trial', data: {condition: 'congruent', media: 'NO', color:'orange', correctKey:'n'}});

    incong_trials.push({inherit: 'stimulus_trial', data: {condition: 'incongruent', media: 'YES', color:'orange', correctKey:'n'}});
    incong_trials.push({inherit: 'stimulus_trial', data: {condition: 'incongruent', media: 'NO', color:'blue', correctKey:'y'}});

    // neutral_trials.push({inherit: 'stimulus_trial', data: {condition: 'neutral', media: 'XXXX', color:'blue', correctKey:'y'}});
    // neutral_trials.push({inherit: 'stimulus_trial', data: {condition: 'neutral', media: 'XXXX', color:'orange', correctKey:'n'}});


    API.addTrialSet('cong', cong_trials);
    API.addTrialSet('incong', incong_trials);
    // API.addTrialSet('neu', neutral_trials);




    
	//console.log('before sequence');
    /***********************************************
    // Sequence
     ***********************************************/
    var sequence = [];
    sequence.push({inherit:'silentStart'}); //Maximize the video
    //First block is the usual
    //current.trials_per_condition = 1; //YBYB: remove soon
    


    sequence.push(


        {
            mixer:'wrapper',
            data : [
            {
    		    inherit: {set:"inst", merge:['stimuli']}, 
    		    stimuli:[{media:{html:current.blockInst[0]}, location:{top:'113px'}}]
            },
         {
    		data: {practice:true},
		    inherit : {set:"startPractice"}
	    },

            
            {
			mixer: 'random',
			data: [
				{   
					mixer: 'repeat',
					times: global.current.num_of_prac_trials,
					data: [
                        {inherit:{set:'cong', type:'equalDistribution', n: cong_trials.length*10, seed: 'cong_P'}, data:{block: 'practice'}}
					]
				},
				{
					mixer: 'repeat',
					times: global.current.num_of_prac_trials,
					data: [
                        {inherit:{set:'incong', type:'equalDistribution', n: incong_trials.length*10, seed: 'incong_P'}, data:{block: 'practice'}}
					]
				}//,
				// {
				// 	mixer: 'repeat',
				// 	times: global.current.num_of_prac_trials,
				// 	data: [
    //                     {inherit:{set:'neu', type:'equalDistribution', n: neutral_trials.length*10, seed: 'neu_P'}, data:{block: 'practice'}}
				// 	]
				// }
			]
		},
        
        
            {
                inherit: {set:"endOfPractice"}
        	},
        	
        	
            		
		{
    		data: {practiceAgain:true},
    		    inherit: {set:"inst", merge:['stimuli']}, 
    		    stimuli:[{media:{html:current.blockInst[1]}, location:{top:'113px'}}]
		},

		{
		    inherit : {set:"startPracticeAgain"}
		},

        	 {
        	    data: {exp:true},
        	    inherit: {set:"inst", merge:['stimuli']}, 
        	    stimuli:[{media:{html:current.blockInst[2]}, css:{cursor:'none', color:'black'},  location:{top:'113px'}}]
        	},
            {
    			mixer: 'random',
    			data: [
    				{
    					mixer: 'repeat',
    					times: global.current.num_of_trials,
    					data: [
                            {inherit:{set:'cong', type:'equalDistribution', n: cong_trials.length*10, seed: 'cong_E'}, data:{block: 'exp'}}
    					]
    				},
    				{
    					mixer: 'repeat',
    					times: global.current.num_of_trials,
    					data: [
                            {inherit:{set:'incong', type:'equalDistribution', n: incong_trials.length*10, seed: 'incong_E'}, data:{block: 'exp'}}
    					]
    				},
    				
    				// {
    				// 	mixer: 'repeat',
    				// 	times: global.current.num_of_trials,
    				// 	data: [
        //                     {inherit:{set:'neu', type:'equalDistribution', n: neutral_trials.length*10, seed: 'neutral_E'}, data:{block: 'exp'}}
    				// 	]
    				// }
    			]
    		},
            {
        	    data: {exp2:true},
        	    inherit: {set:"inst", merge:['stimuli']}, 
        	    stimuli:[{media:{html:current.blockInst[3]}, css:{cursor:'none', color:'black'},  location:{top:'113px'}}]
        	},
        	{
                mixer:'wrapper',
                data : [
                    {
            		    inherit: {set:"inst", merge:['stimuli']}, 
            		    stimuli:[{media:{html:current.blockInst[4]}, location:{top:'113px'}}]
                    },
                                 {
    			mixer: 'random',
    			data: [
    				{
    					mixer: 'repeat',
    					times: global.current.num_of_trials,
    					data: [
                            {inherit:{set:'cong', type:'equalDistribution', n: cong_trials.length*10, seed: 'cong_E2'}, data:{block: 'exp'}}
    					]
    				},
    				{
    					mixer: 'repeat',
    					times: global.current.num_of_trials,
    					data: [
                            {inherit:{set:'incong', type:'equalDistribution', n: incong_trials.length*10, seed: 'incong_E2'}, data:{block: 'exp'}}
    					]
    				}//,
    				
    				// {
    				// 	mixer: 'repeat',
    				// 	times: global.current.num_of_trials,
    				// 	data: [
        //                     {inherit:{set:'neu', type:'equalDistribution', n: neutral_trials.length*10, seed: 'neutral_E2'}, data:{block: 'exp'}}
    				// 	]
    				// }
    			]
    		},

                ]
            },
        	{
        	    inherit: {set:"inst", merge:['stimuli']}, 
        	    stimuli:[{media:{html:current.blockInst[5]}, css:{cursor:'none', color:'black'},  location:{top:'113px'}}]
        	},
		    {
        	    data: {task_over:true},
                inherit: {set:"silentEnd"}

        	}

            
	    ]}),
    

    
    //console.log(sequence);
	API.addSequence(sequence);
	return API.script;
});
