# Quilt NodeJS Server

The graphics playing on the quilt, are controlled and changed remotely using Xbee RF modules. One end is integrated inside the quilt and the other end is connected to server. NodeJS server connects to Xbee model using [serialport](https://www.npmjs.com/package/serialport). It waits till it establishes a successful handshake with quilt controller. Subsequently, using expressJS it'll provide users with a web interface to choose the graphic modes on the quilt. As the user selects their desired mode, server will notify the quilt and updates it's display.



Patchwork is a workshop activity first exhibited In Siggraph 2015 by:

[**Katherine Moriwaki**](http://www.kakirine.com/) & [**Saman Tehrani**](http://samantehrani.com/)