import { Socket } from 'socket.io';
import socketIO from 'socket.io';

// Classes
import { UserList } from '../classes/user-list';
import { User } from '../classes/user';
import { Map } from '../classes/map';
import { PlaceData } from '../classes/PlaceData';

export const connectedUsers = new UserList();
export const map = new Map();

export const clientConnect = ( client: Socket ) => {
  const user = new User( client.id );
  connectedUsers.add( user );

};

export const disconnect = ( client: Socket, io: socketIO.Server ) => {
  client.on( 'disconnect', () => {
    console.log( 'client disconnected!' );
    connectedUsers.deleteUserById( client.id );
  } );
};

export const message = ( client: Socket, io: socketIO.Server ) => {
  client.on( 'message', ( payload: { from: string, body: string; } ) => {
    console.log( 'Message received:', payload );
    io.emit( 'newMessage', payload );
  } );
};

export const userConfig = ( client: Socket, io: socketIO.Server ) => {
  client.on( 'user-config', ( payload: { name: string; }, callback: ( obj: any ) => void ) => {

    connectedUsers.updateName( client.id, payload.name );
    setTimeout( () => {
      io.emit( 'activeUsers', connectedUsers.getList() );
    }, 10 );

    callback( {
      ok: true,
      message: `Usuario ${ payload.name }, configurated`
    } );
  } );
};

// export const getUsers = ( client: Socket, io: socketIO.Server ) => {

//   client.on( 'getUsers', () => {

//     const user = connectedUsers.getList().find( user => user.name === payload.name )
//     if ( user ) {
//       console.log('user logged send list..');
//       io.in( client.id ).emit( 'activeUsers', connectedUsers.getList() )
//     }
//   } );
// }

export const mapSocket = ( client: Socket, io: socketIO.Server ) => {

  client.on( 'add-marker', ( payload: PlaceData ) => {
    console.log( 'adding marker...' );
    map.addMarker( payload );

    client.broadcast.emit( 'add-marker', payload );
  } );

  client.on( 'move-marker', ( payload: PlaceData ) => {
    console.log( 'Moving marker...', payload );
    map.moveMarker( payload );

    client.broadcast.emit( 'move-marker', payload );
  } );

  client.on( 'delete-marker', ( payload: PlaceData ) => {
    console.log( 'Deleting Marker...' );
    map.deleteMarkerById( payload.id );

    client.broadcast.emit( 'delete-marker', payload );
  } );

};

