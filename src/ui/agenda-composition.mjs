/**
 * Composes already-authorized Core public Agenda and independent private assignments.
 * Pure preparation only: NO network calls, credentials, storage, or endpoint assumptions.
 */
import {projectAuthorizedFeed} from '../integrations/authorized-feed.mjs';
import {projectOwnAssignments} from '../integrations/own-assignments.mjs';
import {prepareAgendaView} from './agenda-view-model.mjs';

const FILTERS=new Set(['todo','reuniones','servicio','mis_asignaciones']);
const statusOf=(err)=>err?.code==='not-authorized'?'forbidden':'unavailable';

/** Never report missing data as an empty authorized result. */
export function composeAgendaPresentation({
  publicEnvelope=null,privateEnvelope=null,context,from,to,now=Date.now(),
  filter='todo',selectedDate=null,language='es',today=null,nowTime='00:00'
}={}){
  if(!FILTERS.has(filter))throw new TypeError('unknown-filter');
  const privateRequested=filter==='todo'||filter==='mis_asignaciones';
  const publicRequested=filter!=='mis_asignaciones';
  let publicStatus=publicRequested?'unavailable':'unlinked';
  let privateStatus=privateRequested?'unavailable':'unlinked';
  let publicItems=[],privateItems=[];
  if(publicRequested&&publicEnvelope){
    try {
      publicItems=projectAuthorizedFeed({envelope:publicEnvelope,context,from,to,now,filter:'todo'}).items;
      publicStatus='ready';
    }catch(err){publicStatus=statusOf(err);}
  }
  if(privateRequested&&privateEnvelope){
    try{
      privateItems=projectOwnAssignments({envelope:privateEnvelope,context,from,to,now}).items;
      privateStatus='ready';
    }catch(err){privateStatus=statusOf(err);}
  }
  if(!context?.authenticated||context?.membership?.status!=='active'){
    publicStatus='unlinked';privateStatus='unlinked';publicItems=[];privateItems=[];
  }
  let status,items;
  if(filter==='mis_asignaciones'){
    status=privateStatus;items=privateItems;
  }else{
    status=publicStatus;
    items=publicStatus==='ready'?[...publicItems,...(privateStatus==='ready'&&filter==='todo'?privateItems:[])]:[];
  }
  const view=prepareAgendaView({status,items,filter,selectedDate,language,today,nowTime});
  return Object.freeze({...view,publicStatus,privateStatus,
    // Show incomplete state when public activities are available but private channel is not.
    partial:filter==='todo'&&publicStatus==='ready'&&privateStatus!=='ready'
  });
}
