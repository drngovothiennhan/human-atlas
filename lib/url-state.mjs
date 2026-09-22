export function serializeAtlasState(input={}) {
  const params=new URLSearchParams();
  if(input.mode)params.set('mode',String(input.mode));
  if(input.tab)params.set('tab',String(input.tab));
  if(input.query)params.set('q',String(input.query));
  const text=params.toString();
  return text?'?'+text:'';
}
export function parseAtlasState(search='') {
  const params=new URLSearchParams(String(search).replace(/^\?/,''));
  return {
    mode:params.get('mode')||null,
    tab:params.get('tab')||null,
    query:params.get('q')||''
  };
}
