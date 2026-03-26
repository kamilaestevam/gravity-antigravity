
async function test() {
  try {
    const res = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados/AL/municipios');
    const data = await res.json();
    console.log('Total de municípios em AL:', data.length);
    if (data.length > 0) {
      console.log('Primeiro município:', data[0].nome);
    }
  } catch (err) {
    console.error('Falha no fetch:', err);
  }
}
test();
