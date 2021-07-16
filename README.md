# node-red-contrib-time-profile
A Node-RED node to generate profiles, consisting out of equal length timeslots

***!!!!! THIS IS AN EXPERIMENTAL NODE: THIS NODE IS INCOMPLETE AND THE API/SETTINGS MIGHT STILL CHANGE !!!!!***

## Install
Run the following npm command in your Node-RED user directory (typically ~/.node-red):
```
npm install bartbutenaers/node-red-contrib-time-profile
```

## Node usage
This node supports multiple profile-related commands:

### Schedule profile at index
Generate an output profile of a specified number of timeslots, where the input profile will be scheduled at the specified timeslot index.  All other timeslots in the output profile (which are not occupied by the profile values) will get a `0` value.

For example this input:
```
{
    "startIndex": 35,
    "profile": [
        10,
        20,
        30,
        40,
        50,
        60,
        50,
        40,
        30,
        20,
        10
    ],
    "timeslotCount": 96
}
```
Will result in an output profile of 96 timeslots, and the specified input profile will be scheduled at start index 35.  Which means that the first timeslot of the input profile will be inserted at timeslot index 35 of the output profile:

![image](https://user-images.githubusercontent.com/14224149/125863677-995a4b35-5e8b-4dfd-b042-540dffad3a31.png)

The following example flow shows how to create such a profile, either via the config screen or dynamically via an input message:
```
[{"id":"145c226f.65cdee","type":"inject","z":"1d0bb9e4.8504e6","name":"Schedule profile at index","props":[],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payloadType":"str","x":250,"y":200,"wires":[["2574f801.f0ab48"]]},{"id":"e42f4bca.526188","type":"comment","z":"1d0bb9e4.8504e6","name":"Schedule existing profile into horizon at specified index","info":"","x":320,"y":160,"wires":[]},{"id":"2574f801.f0ab48","type":"time-profile","z":"1d0bb9e4.8504e6","outputField":"payload","command":"schedule_index_profile","timeslotCount":96,"timeslotCountType":"num","timeslotLength":"","timeslotLengthType":"msg","aggregation":"","aggregationType":"msg","profile":"[10,20,30,40,50,60,50,40,30,20,10]","profileType":"json","switchPoints":"","switchPointsType":"msg","startIndex":"35","startIndexType":"num","startHour":"","startHourType":"msg","startMinute":"","startMinuteType":"msg","fixedValue":"","fixedValueType":"msg","name":"","x":490,"y":200,"wires":[["f9410bd3.22d7f8"]]},{"id":"f9410bd3.22d7f8","type":"debug","z":"1d0bb9e4.8504e6","name":"Scheduled profile","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"payload","targetType":"msg","statusVal":"","statusType":"auto","x":710,"y":200,"wires":[]},{"id":"8aa0a6fc.ffe298","type":"inject","z":"1d0bb9e4.8504e6","name":"Schedule profile at index","props":[{"p":"payload"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"{\"startIndex\":35,\"profile\":[10,20,30,40,50,60,50,40,30,20,10],\"timeslotCount\":96}","payloadType":"json","x":250,"y":240,"wires":[["b73b3125.5ebb9"]]},{"id":"b73b3125.5ebb9","type":"time-profile","z":"1d0bb9e4.8504e6","outputField":"payload","command":"schedule_index_profile","timeslotCount":"payload.timeslotCount","timeslotCountType":"msg","timeslotLength":"","timeslotLengthType":"msg","aggregation":"","aggregationType":"msg","profile":"payload.profile","profileType":"msg","switchPoints":"","switchPointsType":"msg","startIndex":"payload.startIndex","startIndexType":"msg","name":"","x":490,"y":240,"wires":[["f9410bd3.22d7f8","91dd13642e8fa1ac"]]}]
```
  
### Schedule profile at time
Generate an output profile of a specified number of timeslots, where the input profile will be scheduled at the specified time (hour:minute).  All other timeslots in the output profile (which are not occupied by the profile values) will get a `0` value.
  
Note that it is required to specify the time length of a single timeslot, to allow this node to calculate in which timeslot the profile needs to be started.

For example this input:
```
{
    "startHour": 8,
    "startMinute": 45,
    "profile": [
        10,
        20,
        30,
        40,
        50,
        60,
        50,
        40,
        30,
        20,
        10
    ],
    "timeslotCount": 96,
    "timeslotLength": 900
}
```
Will result in an output profile of 96 timeslots with length 900 seconds (i.e. 15 minutes), and the specified input profile will be scheduled at time 08:45.  Which means that the first timeslot of the input profile will be inserted at the timeslot of the output profile that matches that time:

![image](https://user-images.githubusercontent.com/14224149/125863677-995a4b35-5e8b-4dfd-b042-540dffad3a31.png)

The following example flow shows how to create such a profile, either via the config screen or dynamically via an input message:
```
The following example flow shows how to create such a profile, either via the config screen or dynamically via an input message:
```

### Down-sample profile
Group every block of N successive timeslots (as specified by the number of timeslots), and calculate the aggregated value of those timeslots.  Different types of aggregation can be specified: minimum, maximum and average.  As a result, the output profile will be N times shorter compared to the input profile (since it only contains the aggregated numeric values).
  
A typical use case is to convert for example a 5-minute profile to a 15-minute profile by grouping every 3 successive profile values.  This could be useful if you have measured the consumption of an electrical appliance very frequently (i.e. every 5 minutes), but you only need to have a consumption profile with a lower time resolution (i.e. every 15 minutes).

For example this input:
```
{
    "profile": [
        10,
        20,
        30,
        40,
        50,
        60,
        60,
        50,
        40,
        30,
        20,
        10
    ],
    "aggregation": "maximum",
    "timeslotCount": 4
}
```
Will result in an output profile of 3 timeslots, because every 4 succesive profile values will be aggregated (= timeslotCount parameter which represents the downsampling factor or aggregation window length):

![image](https://user-images.githubusercontent.com/14224149/125862167-a29648f3-a1ce-41ac-a324-54494e630506.png)

The following example flow shows how to create such a profile, either via the config screen or dynamically via an input message:
```
[{"id":"846e397e.440848","type":"inject","z":"1d0bb9e4.8504e6","name":"Down-sample profile (average)","props":[],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","x":270,"y":780,"wires":[["af0c386e.105618"]]},{"id":"91686643.747728","type":"inject","z":"1d0bb9e4.8504e6","name":"Down-sample profile (maximum)","props":[{"p":"payload"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"{\"profile\":[10,20,30,40,50,60,60,50,40,30,20,10],\"aggregation\":\"maximum\",\"timeslotCount\":4}","payloadType":"json","x":270,"y":820,"wires":[["5700a964.ca2488"]]},{"id":"6de02260.b3fafc","type":"comment","z":"1d0bb9e4.8504e6","name":"Down-sample existing profile (by aggregation)","info":"A profile can have N times more timeslots as required.  For example measure the load profile of a washing machine with timeslots of 1 minute (i.e. measure with a Shelly a power consumption value in Kw every minute).  But the optimizer uses a horizon with timeslots of 5 minutes...\n\nThat means that we will group the timeslots of the input profile in groups of 5 timeslots.\n\nDuring grouping, the timeslot values need to be aggegated into a single value.  Different kind of aggregations are possible:\n+ Minimum: get the minimum value of all involved timeslot values.\n+ Maximum: get the maximum value of all involved timeslot values.\n+ Average: get the average value of all involved timeslot values.\n\n\nWhen we want the optimizer to do peak reduction, it is obvious that we need to get the 'maximum' value of all timeslots here ...","x":290,"y":740,"wires":[]},{"id":"af0c386e.105618","type":"time-profile","z":"1d0bb9e4.8504e6","outputField":"payload","command":"down_sample_profile","timeslotCount":"4","timeslotCountType":"num","timeslotLength":"","timeslotLengthType":"msg","aggregation":"average","aggregationType":"aggr","profile":"[10,20,30,40,50,60,60,50,40,30,20,10]","profileType":"json","switchPoints":"","switchPointsType":"msg","startIndex":"","startIndexType":"msg","startHour":"","startHourType":"msg","startMinute":"","startMinuteType":"msg","fixedValue":"","fixedValueType":"msg","name":"","x":510,"y":780,"wires":[["86c6ea50.460a58"]]},{"id":"86c6ea50.460a58","type":"debug","z":"1d0bb9e4.8504e6","name":"Down-sampled profile","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"payload","targetType":"msg","statusVal":"","statusType":"auto","x":720,"y":780,"wires":[]},{"id":"5700a964.ca2488","type":"time-profile","z":"1d0bb9e4.8504e6","outputField":"payload","command":"down_sample_profile","timeslotCount":"payload.timeslotCount","timeslotCountType":"msg","timeslotLength":"","timeslotLengthType":"msg","aggregation":"payload.aggregation","aggregationType":"msg","profile":"payload.profile","profileType":"msg","switchPoints":"","switchPointsType":"msg","startIndex":"","startIndexType":"msg","startHour":"","startHourType":"msg","startMinute":"","startMinuteType":"msg","fixedValue":"","fixedValueType":"msg","name":"","x":510,"y":820,"wires":[["86c6ea50.460a58"]]}]
```

### Up-sample profile
Every timeslot of the input profile will be duplicated N times, which means that a single timeslot will result in N successive time intervals containing the same numerical value.  As a result, the output profile will be N times longer compared to the input profile.
  
A typical use case is to ***convert*** for example a 15-minute profile to a 5-minute profile by duplicating every timeslot 3 times.  This can be handy if you have measured the power consumption of an electrical appliance at a low frequency (i.e. every 15 minutes), but you need a 5-minute consumption profile.

For example this input:
```
{
    "profile": [
        10,
        20,
        30,
        40
    ],
    "timeslotCount": 4
}
```
Will result in an output profile of 16 timeslots, because every profile value will be repeated 4 times (= timeslotCount parameter which represents the upsampling factor):

![image](https://user-images.githubusercontent.com/14224149/125862633-84b26efd-75ee-4a2f-b904-ab114cc3017d.png)

The following example flow shows how to create such a profile, either via the config screen or dynamically via an input message:

```
[{"id":"4127f09.771351","type":"inject","z":"1d0bb9e4.8504e6","name":"Up-sample profile (duplication)","props":[],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","x":260,"y":920,"wires":[["cb6f21d.b5dace"]]},{"id":"70ce5a1a.feb494","type":"comment","z":"1d0bb9e4.8504e6","name":"Up-sample existing profile (by duplication)","info":"A profile can have N times less timeslots as required.  For example measure the load profile of a washing machine with timeslots of 5 minute (i.e. measure with a Shelly a power consumption value in Kw every 5 minutes).  But the optimizer uses a horizon with timeslots of 1 minutes...\n\nAlthough that might not be efficient, we have added this feature anyway ...\n\nThat means that we will have to split the timeslot values in N separate timeslots.  Note that the original timeslot value will be duplicated to all the new timeslots.","x":280,"y":880,"wires":[]},{"id":"cb6f21d.b5dace","type":"time-profile","z":"1d0bb9e4.8504e6","outputField":"payload","command":"up_sample_profile","timeslotCount":"4","timeslotCountType":"num","timeslotLength":"","timeslotLengthType":"msg","aggregation":"","aggregationType":"msg","profile":"[10,20,30,40]","profileType":"json","switchPoints":"","switchPointsType":"msg","startIndex":"","startIndexType":"msg","startHour":"","startHourType":"msg","startMinute":"","startMinuteType":"msg","fixedValue":"","fixedValueType":"msg","name":"","x":510,"y":920,"wires":[["ecc959d9.99fa78"]]},{"id":"ecc959d9.99fa78","type":"debug","z":"1d0bb9e4.8504e6","name":"Down-sampled profile","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"payload","targetType":"msg","statusVal":"","statusType":"auto","x":720,"y":920,"wires":[]},{"id":"967de09b.bb8b3","type":"inject","z":"1d0bb9e4.8504e6","name":"Up-sample profile (duplication)","props":[{"p":"payload"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"{\"profile\":[10,20,30,40],\"timeslotCount\":4}","payloadType":"json","x":260,"y":960,"wires":[["97007d8c.09468"]]},{"id":"97007d8c.09468","type":"time-profile","z":"1d0bb9e4.8504e6","outputField":"payload","command":"up_sample_profile","timeslotCount":"payload.timeslotCount","timeslotCountType":"msg","timeslotLength":"","timeslotLengthType":"msg","aggregation":"","aggregationType":"msg","profile":"payload.profile","profileType":"msg","switchPoints":"","switchPointsType":"msg","startIndex":"","startIndexType":"msg","startHour":"","startHourType":"msg","startMinute":"","startMinuteType":"msg","fixedValue":"","fixedValueType":"msg","name":"","x":510,"y":960,"wires":[["ecc959d9.99fa78","91dd13642e8fa1ac"]]}]
```

#### Create (switchpoint) profile by indexes
Create a new profile based on switchpoint indexes, by specifying a start index and numerical value for every switchpoint.  The start index is the index of the timeslot from where on the numerical value will be applied.

For example this input:
```
{
    "switchPoints": [
        {
            "index": 0,
            "value": 10
        },
        {
            "index": 32,
            "value": 60
        },
        {
            "index": 64,
            "value": 40
        }
    ],
    "timeslotCount": 96
}
```
Will result in an output profile of 96 timeslots (of unspecified length).  Starting from timeslot index 0 the profile timeslots will contain value 0, and from timeslot index 32 the timeslots will contain value 60.  And from timeslot index 64 till the end of the output profile, the timeslots will contain value 40: 

![image](https://user-images.githubusercontent.com/14224149/125852618-a14a2672-2c1e-4b0b-8231-07684355a0a7.png)

The following example flow shows how to create such a profile, either via the config screen or dynamically via an input message:
```
[{"id":"ec4acbec.0fb148","type":"inject","z":"1d0bb9e4.8504e6","name":"Create switchpoint profile at index","props":[],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","x":280,"y":500,"wires":[["d803ce19.865be"]]},{"id":"d803ce19.865be","type":"time-profile","z":"1d0bb9e4.8504e6","outputField":"payload","command":"create_index_profile","timeslotCount":96,"timeslotCountType":"num","timeslotLength":"","timeslotLengthType":"msg","aggregation":"","aggregationType":"msg","profile":"","profileType":"msg","switchPoints":"[{\"index\":0,\"value\":10},{\"index\":32,\"value\":60},{\"index\":64,\"value\":40}]","switchPointsType":"json","startIndex":"","startIndexType":"msg","startHour":"","startHourType":"msg","startMinute":"","startMinuteType":"msg","fixedValue":"","fixedValueType":"msg","name":"","x":510,"y":500,"wires":[["7b69da39.01f6a4"]]},{"id":"7b69da39.01f6a4","type":"debug","z":"1d0bb9e4.8504e6","name":"Switchpoint profile","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"payload","targetType":"msg","statusVal":"","statusType":"auto","x":710,"y":500,"wires":[]},{"id":"ea8068d1.d6ea68","type":"comment","z":"1d0bb9e4.8504e6","name":"Create a profile based on index switchpoints","info":"The last timeslot does not need to be specified.","x":290,"y":460,"wires":[]},{"id":"bfaa2f6a.a3ad1","type":"inject","z":"1d0bb9e4.8504e6","name":"Create switchpoint profile at index","props":[{"p":"payload"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"{\"switchPoints\":[{\"index\":0,\"value\":10},{\"index\":32,\"value\":60},{\"index\":64,\"value\":40}],\"timeslotCount\":96}","payloadType":"json","x":280,"y":540,"wires":[["25763fe.cdc18c"]]},{"id":"25763fe.cdc18c","type":"time-profile","z":"1d0bb9e4.8504e6","outputField":"payload","command":"create_index_profile","timeslotCount":"payload.timeslotCount","timeslotCountType":"msg","timeslotLength":"","timeslotLengthType":"msg","aggregation":"","aggregationType":"msg","profile":"","profileType":"msg","switchPoints":"payload.switchPoints","switchPointsType":"msg","startIndex":"","startIndexType":"msg","startHour":"","startHourType":"msg","startMinute":"","startMinuteType":"msg","fixedValue":"","fixedValueType":"msg","name":"","x":510,"y":540,"wires":[["7b69da39.01f6a4"]]}]
```

### Create (switchpoint) profile by times
Create a new switchpoint profile based on switchpoint times, by specifying a time (format "hour:minute") and numerical value for every switchpoint.  

A typical use case for this command is to generate a ***TOU (Time Of Use)*** profile, for example to specify electricity prices during a 24-hour time horizon.

For example this input:
```
{
    "switchPoints": [
        {
            "startHour": 0,
            "startMinute": 0,
            "value": 10
        },
        {
            "startHour": 8,
            "startMinute": 0,
            "value": 60
        },
        {
            "startHour": 16,
            "startMinute": 0,
            "value": 40
        }
    ],
    "timeslotCount": 96,
    "timeslotLength": 900
}
```
Will result in an output profile of 96 timeslots, each with a length of 900 seconds (i.e. 15 minutes).  Starting from 00:00 the profile timeslots will contain value 10, and from 08:00 the timeslots will contain value 60.  And from 16:00 till the end of the output profile, the timeslots will contain value 40:  

![image](https://user-images.githubusercontent.com/14224149/125852618-a14a2672-2c1e-4b0b-8231-07684355a0a7.png)

Note that the end of the horizon will be 23:59, since we have specified 96 timeslots of 15 minutes length.

The following example flow shows how to create such a profile, either via the config screen or dynamically via an input message:
```
[{"id":"3f5fb8cc.512e58","type":"inject","z":"1d0bb9e4.8504e6","name":"Create switchpoint profile at time","props":[],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","x":270,"y":640,"wires":[["2cb4f1cd.0ba7fe"]]},{"id":"6a34a67d.4a2648","type":"comment","z":"1d0bb9e4.8504e6","name":"Create a profile based on time switchpoints","info":"The last timeslot does not need to be specified.","x":280,"y":600,"wires":[]},{"id":"2cb4f1cd.0ba7fe","type":"time-profile","z":"1d0bb9e4.8504e6","outputField":"payload","command":"create_time_profile","timeslotCount":96,"timeslotCountType":"num","timeslotLength":"900","timeslotLengthType":"num","aggregation":"","aggregationType":"msg","profile":"","profileType":"msg","switchPoints":"[{\"startHour\":0,\"startMinute\":0,\"value\":10},{\"startHour\":8,\"startMinute\":0,\"value\":60},{\"startHour\":16,\"startMinute\":0,\"value\":40}]","switchPointsType":"json","startIndex":"","startIndexType":"msg","startHour":"","startHourType":"msg","startMinute":"","startMinuteType":"msg","fixedValue":"","fixedValueType":"msg","name":"","x":510,"y":640,"wires":[["c493cb7b.113a48"]]},{"id":"c493cb7b.113a48","type":"debug","z":"1d0bb9e4.8504e6","name":"Switchpoint profile","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"payload","targetType":"msg","statusVal":"","statusType":"auto","x":710,"y":640,"wires":[]},{"id":"5903fcfd.f31ba4","type":"inject","z":"1d0bb9e4.8504e6","name":"Create switchpoint profile at time","props":[{"p":"payload"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"{\"switchPoints\":[{\"startHour\":0,\"startMinute\":0,\"value\":10},{\"startHour\":8,\"startMinute\":0,\"value\":60},{\"startHour\":16,\"startMinute\":0,\"value\":40}],\"timeslotCount\":96,\"timeslotLength\":900}","payloadType":"json","x":270,"y":680,"wires":[["cadf447c.81f218"]]},{"id":"cadf447c.81f218","type":"time-profile","z":"1d0bb9e4.8504e6","outputField":"payload","command":"create_time_profile","timeslotCount":"payload.timeslotCount","timeslotCountType":"msg","timeslotLength":"payload.timeslotLength","timeslotLengthType":"msg","aggregation":"","aggregationType":"msg","profile":"","profileType":"msg","switchPoints":"payload.switchPoints","switchPointsType":"msg","startIndex":"","startIndexType":"msg","startHour":"","startHourType":"msg","startMinute":"","startMinuteType":"msg","fixedValue":"","fixedValueType":"msg","name":"","x":510,"y":680,"wires":[["c493cb7b.113a48","91dd13642e8fa1ac"]]}]
```
  
### Create flat profile
Generate a horizontal flat line profile, by specifying the number of timeslots and the fixed numeric value.
  
For example this input:
```
{
    "constantValue":20,
    "timeslotCount":96
}
```
Will result in an output profile of 96 timeslots, all containing the same numerical value 20:

![image](https://user-images.githubusercontent.com/14224149/125849876-a505bd3e-394e-412d-875b-e591288ee17f.png)

The following example flow shows how to create such a profile, either via the config screen or dynamically via an input message:
```
[{"id":"af6a204d.9c006","type":"inject","z":"1d0bb9e4.8504e6","name":"Create flat profile","props":[],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","x":220,"y":60,"wires":[["85d3e160.bfff7"]]},{"id":"1f40144d.bb853c","type":"comment","z":"1d0bb9e4.8504e6","name":"Create a constant horizontal flat line profile","info":"This profile covers the entire horizon.  If only a part of the horizon needs to be covered, use a switchpoint profile instead.","x":280,"y":20,"wires":[]},{"id":"85d3e160.bfff7","type":"time-profile","z":"1d0bb9e4.8504e6","outputField":"payload","command":"create_flat_profile","timeslotCount":96,"timeslotCountType":"num","timeslotLength":"","timeslotLengthType":"msg","aggregation":"","aggregationType":"msg","profile":"","profileType":"msg","switchPoints":"","switchPointsType":"msg","startIndex":"","startIndexType":"msg","startHour":"","startHourType":"msg","startMinute":"","startMinuteType":"msg","fixedValue":"20","fixedValueType":"num","name":"","x":418,"y":60,"wires":[["ab1f00d7.46cad"]]},{"id":"ab1f00d7.46cad","type":"debug","z":"1d0bb9e4.8504e6","name":"Flat profile","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"payload","targetType":"msg","statusVal":"","statusType":"auto","x":618,"y":60,"wires":[]},{"id":"549cd7d3.a274f8","type":"inject","z":"1d0bb9e4.8504e6","name":"Create flat profile","props":[{"p":"payload"}],"repeat":"","crontab":"","once":false,"onceDelay":0.1,"topic":"","payload":"{\"constantValue\":20, \"timeslotCount\":96}","payloadType":"json","x":220,"y":100,"wires":[["a394640e.feb428"]]},{"id":"a394640e.feb428","type":"time-profile","z":"1d0bb9e4.8504e6","outputField":"payload","command":"create_flat_profile","timeslotCount":"payload.timeslotCount","timeslotCountType":"msg","timeslotLength":"","timeslotLengthType":"msg","aggregation":"","aggregationType":"msg","profile":"","profileType":"msg","switchPoints":"","switchPointsType":"msg","startIndex":"","startIndexType":"msg","startHour":"","startHourType":"msg","startMinute":"","startMinuteType":"msg","fixedValue":"payload.constantValue","fixedValueType":"msg","name":"","x":418,"y":100,"wires":[["c712f460.6d6528"]]},{"id":"c712f460.6d6528","type":"debug","z":"1d0bb9e4.8504e6","name":"Flat profile","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"payload","targetType":"msg","statusVal":"","statusType":"auto","x":618,"y":100,"wires":[]}]
```

## Example use case
I had measured the power consumption of our washing machine using a Shelly Plug S Smart Wifi Plug, by sending a request once every minute. The resulting profile was being stored into Node-RED context memory, which means a consumption profile of resolution 1 minute. 

Using following simple flow, I could show the consumption profiles on my dashboard.  The 1-minute profiles are injected into memory at startup, after they have been downsampled to a 1-minute profile.  Via a dropdown I can select which consumption profile needs to be displayed:

![image](https://user-images.githubusercontent.com/14224149/125864815-6609466a-f869-4350-93f4-ccee60f1a180.png)
```
[{"id":"d6d747ff.d1c6b8","type":"inject","z":"1d0bb9e4.8504e6","name":"Profile - washing machine - mode 60° eco (1600 rotations)","props":[{"p":"payload"}],"repeat":"","crontab":"","once":true,"onceDelay":0.1,"topic":"","payload":"[1,17,26,21,20,27,32,30,32,348,2023,2039,2036,2020,2020,2019,2016,2028,2025,2025,2031,2044,2079,2080,2062,2062,2071,2063,2057,2058,2067,2073,2070,912,76,78,209,2079,1409,82,78,88,82,83,75,498,96,82,76,79,81,75,81,79,85,77,82,70,76,76,77,74,79,85,78,82,81,82,74,80,76,79,75,78,74,75,76,75,80,73,76,74,79,74,91,80,78,73,78,152,72,75,81,74,82,72,78,71,77,70,80,66,70,75,78,179,138,195,112,23,53,96,108,116,95,76,93,153,169,300,121,30,60,99,115,113,89,72,124,129,205,282,226,197,450,417,404,412,528,514,467,19,9,1,2,1,2]","payloadType":"json","x":310,"y":1100,"wires":[["ac253637.f0d798"]]},{"id":"fe3c7f20.37d43","type":"comment","z":"1d0bb9e4.8504e6","name":"1-minute profile","info":"","x":160,"y":1060,"wires":[]},{"id":"1c24be99.3dc2f1","type":"function","z":"1d0bb9e4.8504e6","name":"Get profile","func":"var loadProfiles = flow.get(\"load_profiles\") || {};\n\n// The payload contains the key (of the profile that has been selected in the dropdown)\nvar selectedLoadProfileKey = msg.payload;\n\n// Get from the flow memory the profile with that selected key\nvar selectedLoadProfile = loadProfiles[selectedLoadProfileKey];\n\nreturn {payload: selectedLoadProfile.profile, topic: selectedLoadProfile.description};","outputs":1,"noerr":0,"initialize":"","finalize":"","libs":[],"x":1350,"y":1100,"wires":[["9a8f1ff8.aae0f"]]},{"id":"5c54b060.91769","type":"change","z":"1d0bb9e4.8504e6","name":"Store in flow","rules":[{"t":"set","p":"load_profiles.washing_machine_eco_60.description","pt":"flow","to":"Washing machine - Eco 60° (1600 rotations)","tot":"str"},{"t":"set","p":"load_profiles.washing_machine_eco_60.profile","pt":"flow","to":"payload","tot":"msg"}],"action":"","property":"","from":"","to":"","reg":false,"x":810,"y":1100,"wires":[["a3901a85.70ce28"]]},{"id":"d5533c40.0a23a","type":"comment","z":"1d0bb9e4.8504e6","name":"Convert to 5 minute profile (peak)","info":"","x":670,"y":1060,"wires":[]},{"id":"1015dd17.125413","type":"ui_dropdown","z":"1d0bb9e4.8504e6","name":"","label":"Select profile","tooltip":"","place":"Select option","group":"94420493.ce71b8","order":1,"width":"10","height":"1","passthru":false,"multiple":false,"options":[{"label":"","value":"","type":"str"}],"payload":"","topic":"","x":1170,"y":1100,"wires":[["1c24be99.3dc2f1"]]},{"id":"a3901a85.70ce28","type":"function","z":"1d0bb9e4.8504e6","name":"Fill options","func":"var options = [];\n\nvar loadProfiles = flow.get(\"load_profiles\") || {};\n\nfor (var key in loadProfiles) {\n    var description = loadProfiles[key].description;\n    var option = {};\n    option[description] = key;\n    options.push(option);\n}\n\nreturn {options: options};","outputs":1,"noerr":0,"initialize":"","finalize":"","libs":[],"x":990,"y":1100,"wires":[["1015dd17.125413"]]},{"id":"9a8f1ff8.aae0f","type":"ui_template","z":"1d0bb9e4.8504e6","group":"94420493.ce71b8","name":"Load profile Chart","order":2,"width":"16","height":"8","format":"<canvas id=\"loadProfileChart\" width=\"500\" height=\"250\"></canvas>\n<script>\n(function(scope) {\n    var chartJsInstance = null;\n      \n    // Use the colors of the Node-RED dashboard\n    var textcolor = getComputedStyle(document.documentElement).getPropertyValue('--nr-dashboard-widgetTextColor').trim();\n    var gridcolor = getComputedStyle(document.documentElement).getPropertyValue('--nr-dashboard-groupBorderColor').trim();\n    var linecolor = getComputedStyle(document.documentElement).getPropertyValue('--nr-dashboard-groupTextColor').trim();\n\n    scope.$watch('msg', function(msg) {\n        if (!msg) {\n            return;\n        }\n\n        // The labels on the X-axis are the interval index numbers\n        var labels = [];\n        for(var i = 0; i < msg.payload.length; i++){\n            labels.push(i + 1);\n        }\n    \n        if (chartJsInstance) {\n            // Load the entire chart from scratch, since the input msg contains the values of the entire profile\n            chartJsInstance.destroy();\n        }\n\n        var ctx = document.getElementById(\"loadProfileChart\").getContext(\"2d\");\n\n        chartJsInstance = new Chart(ctx, {\n            type: 'bar',\n            data: {\n                labels: labels,\n                datasets: [{\n                    type:'bar',\n                    label: msg.topic,\n                    backgroundColor: linecolor,\n                    borderColor: linecolor,\n                    data: msg.payload,\n                    yAxisID: 'left-y-axis',\n                    barPercentage: 0.5,\n                    barThickness: 6,\n                    maxBarThickness: 8,\n                    minBarLength: 2,\n                }]\n            },\n            options: {\n                scales: {\n                    yAxes: [{\n                        gridLines: {zeroLineColor:gridcolor,color:gridcolor,lineWidth:0.5},\n                        id: 'left-y-axis',\n                        type: 'linear',\n                        position: 'left',\n                        ticks: {\n                            fontColor: linecolor,\n                            min: 0\n                        }\n                    }],\n                    xAxes: [{\n                        gridLines :{zeroLineColor:gridcolor,color:gridcolor,lineWidth:0.5},\n                        ticks: {\n                            fontColor:textcolor,\n                            maxRotation: 0,\n                            autoSkip: true,\n                            padding: 20\n                        }\n                    }]\n                }\n            }\n        });\n    });\n})(scope);\n</script>","storeOutMessages":false,"fwdInMessages":false,"resendOnRefresh":false,"templateScope":"local","x":1550,"y":1100,"wires":[[]]},{"id":"15e3cb24.b99ea5","type":"inject","z":"1d0bb9e4.8504e6","name":"Profile - washing machine - fast 40° (800 rotations)","props":[{"p":"payload"}],"repeat":"","crontab":"","once":true,"onceDelay":0.1,"topic":"","payload":"[1866,2194,2188,2187,2182,2168,2167,2172,2176,2168,2178,2183,1766,104,109,110,98,113,107,105,101,112,110,98,112,107,103,99,113,108,99,110,110,109,102,109,104,44,43,33,82,98,105,82,45,18,49,48,50,51,61,28,75,71,59,65,61,77,155,131,106,20,25,23,25,12,1,2,2,1,1]","payloadType":"json","x":330,"y":1140,"wires":[["5ac80029.0bbaa"]]},{"id":"8b692ca4.f0861","type":"change","z":"1d0bb9e4.8504e6","name":"Store in flow","rules":[{"t":"set","p":"load_profiles.washing_machine_fast_40.description","pt":"flow","to":"Washing machine - Fast 40° (800 rotations)","tot":"str"},{"t":"set","p":"load_profiles.washing_machine_fast_40.profile","pt":"flow","to":"payload","tot":"msg"}],"action":"","property":"","from":"","to":"","reg":false,"x":810,"y":1140,"wires":[["a3901a85.70ce28"]]},{"id":"5ac80029.0bbaa","type":"time-profile","z":"1d0bb9e4.8504e6","outputField":"payload","command":"down_sample_profile","timeslotCount":"5","timeslotCountType":"num","timeslotLength":"","timeslotLengthType":"msg","aggregation":"maximum","aggregationType":"aggr","profile":"payload","profileType":"msg","switchPoints":"","switchPointsType":"msg","startIndex":"","startIndexType":"msg","startHour":"","startHourType":"msg","startMinute":"","startMinuteType":"msg","fixedValue":"","fixedValueType":"msg","name":"Downsample","x":630,"y":1140,"wires":[["8b692ca4.f0861"]]},{"id":"ac253637.f0d798","type":"time-profile","z":"1d0bb9e4.8504e6","outputField":"payload","command":"down_sample_profile","timeslotCount":"5","timeslotCountType":"num","timeslotLength":"","timeslotLengthType":"msg","aggregation":"maximum","aggregationType":"aggr","profile":"payload","profileType":"msg","switchPoints":"","switchPointsType":"msg","startIndex":"","startIndexType":"msg","startHour":"","startHourType":"msg","startMinute":"","startMinuteType":"msg","fixedValue":"","fixedValueType":"msg","name":"Downsample","x":630,"y":1100,"wires":[["5c54b060.91769"]]},{"id":"94420493.ce71b8","type":"ui_group","name":"Load profiles","tab":"9cdb817b.45e12","order":1,"disp":true,"width":"20","collapse":false},{"id":"9cdb817b.45e12","type":"ui_tab","name":"Energy","icon":"dashboard","order":41,"disabled":false,"hidden":false}]
```
Note that this flow is far from complete!  It is only used here as a basic example to demonstrate how to show the consumption profiles (of your appliances) in your Node-RED dashboard:

![demo_use_case](https://user-images.githubusercontent.com/14224149/125865262-7e3d34fd-4462-4385-891d-a7265234dc52.gif)

The down-sampling nodes have been added to have a light low-resolution graph in the dashboard.  This can be useful - if you have measured the power consumption at high resolutions - but you don't want to send too much data to your dashboard.  However it is also useful to can remove the down-sampling nodes, to see a ***high resolution graph which shows much more detail (like e.g. shorter peaks)***:

![image](https://user-images.githubusercontent.com/14224149/126013125-0e10ddcd-e74d-4fd2-9381-2737352f7265.png)
