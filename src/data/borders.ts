// Phase 2 render-only outlines derived from the 2026-10-05 OSM-Boundaries archives.
// These are reduced polygon previews, NOT the complete original polygons.
// Phase 3 will publish immutable full-resolution geometry data and provenance manifests.
// Standard Google polyline encoding, precision 1e5, ring coordinates lat/lon.
const outlines = {
  ro: {
    detailed: ["}}nxGoltzBxiMmlOviHmMl_H}gYf~JqlEwoBgmIz}F_kAbzFwmNljNeyFwWsiM_cEqz@lbA}uFr_V~oBxuG~sFp~Mk`Lx|In_Kb{A{rQnoE`JbzAwzIxaQ}xQsl@ocHd`FgnE{uDioNbqM_lGddCy_c@fjJewT|nEumAfgB|pH|wN`kCx{BzuQluJmgNpzD}cTnbG_sAdxCtud@`hFfbAdhH_wFz}Bmcd@rmRo}HtgDwndAzvP{sGb{LqlRowAgzHu|`@muVcbI}bW~Jg}HfaMwcPlpBksSvcHkxLn`EkfBrsCfqKucEd|UjxKvbEjXv{ObrDhE|oZepQz_EsuVjiMu`AvsXymdAxjJlaEtzD|mX~`TnhGdqGqkFvbFu{a@{bJkcgA`~Jocb@{{@e{[d}UovoAakAkra@opKis]hgAwpQxsKs}Ws_Hsfm@`nGcmVunA{sRl~Ncti@{xOelgAqnu@ywfAecIwde@kzFcbqAaeM_|w@bbCsik@ffIglBrfByvK`aHulG?ooh@mzEykE~fQ}bPqlAavTeeG}hMph_@ucNrnOsfn@vyCiah@o]q{nAqogCs{t@_gSk`QahHmplAa{S_}d@ayKycKqp~@my_@yeOnfQyhC|`r@k{[dwFyoLbqRuqEjsVv|@jld@vzRtdt@nzH~tC}qIrm[tdEgk@zuBd_Iv|Fo|FxzBh}Nq{Q|teA}cWfjLw{DjnQ{}ElgE}wKcPwuD~hLm_GuvOovY~}Bq~@d`Ga`Lzl@akBejDcuXzgHmbKwUkkQipIshN|mEweLsaQ}eG|zBgnMuyM__DhsBs}@qrBunGbrH_zSmmG{i_@zyMirGzcKysLpAsdAz`EopBkxD_dBtdEe`Go~AmmEhpKkNegCgbAz_@aoHtn\\{jHt}LgxAafBai@f~JopCmzDyxWtlNns@l_Hq|C`j@wqBjeRoFe{BiiAqxA_hEl_Hg{Ee`Bk{C|fEucEywBk~B||QkbR`eHa~GzxQsuPpvNeVyeGyjDw]o~Kv`OauB{_E}iA|aIiKquB_}HfxAsyAbcJmpDsvEagCjqEq{DazBkpAfmMueCuvByfJv_OosHiMrXbpLwtBb[dIgeF_vAxaJybEkt@r|AryFm_Cw`@glIjqRym@z~`@tiGleKjmDloj@def@`ya@jqQpluDboSbzLzwKjtW`Evq]iyQjyI_wBjwVmbT|cNyxBf|H_QzsZ|wIv~OjqBd~WixLpth@z~E|}ZcaI~{Gy@`~\\gnFppYhpIv`FqlNfdg@alI`~Bi{B~uRdlE~hI`|NdrCr}Az~MuqDr{ObcIu_C~rJ|qRtxA~lPv~HczBne@voKbmH~oEh}AroX}mF~iLpo@|nEpcKvmBc|Cx}TbgNj{P`hQttHwU~mHjrJtlOpxI`fFf|IcoD~aIxpCdPxiM~bYx|OleIue@xwAb|Fj~Kr|Cxo@v|K`jJnbNjpFizFxaGf~@zlE|sNl|KrJx}C`dN|{L|_FlqGg_HtxE~fFip@pcKlkEgzCvtFrwGpYjvQjxEyh@hxNhxJl_IoeJ|qGheCtTfqPljRx_DjNxuK~mJzsHcwG`td@vhAbaR|{CfeDz`H}nAeQlvEh|FhlAvyFpxM_jKx{Y`eH|gGmfDzeSnpH`hQ"],
    simplified: ["}}nxGoltzB|hgAqttAixCc|Vxsx@bdIxh{@qgpC|l\\de]ntXk`f@dxCtud@fqOwsDdu[uqsB~r^ma[ixm@stx@lcZwo|@hvVzmv@d{n@ohk@vsXymdAnhe@zyf@|tNghi@{bJkcgAj_`@ewoCq|Muf`AhzZconD{xOelgAqnu@ywfAsd_@{dpD`sYk|cAmzEi|n@~fQ}bPwrI_`c@ph_@ucNrnOsfn@f{B{}wBqogCs{t@clq@yodCsjkAg~k@soSlhdAk{[dwFobSnej@~s^`h~A}qIrm[buTvsOq{Q|teAu`]ry^qmXh`Rm_GuvOiyeAvjPu~tBat_@iofA~o]mfcAtscBcwYrw@mwp@lt}@o}t@vcPepq@tgdAfiKvuxAdef@`ya@jqQpluD~g`@noe@`Evq]qnn@|sz@hxLxrdAizLzbmC}u\\hz~@j{_Ap_~AjfCbxeAxlk@vmt@xx^vgE~lhBnf_BjnUi~@bdSh`i@br_@_V`s[jxY~nDzanAtc\\rsY_jKx{YboLzwm@"]
  },
  md: {
    detailed: ["mpseHqomaDnlDkvH_q@a~Z~jIukRl_Cv`@}sAmdGbzDd_A~uAyaJeIfeFvtBc[lYqvNvuF`zA|jJcbOfkCvrBf|A{uMtoDtbC`gCkqElpDrvEryAccJ~|HgxAhKpuB|iA}aI`uBz_EtxKq~NrpDp[dVxeGfeJiqGlnNc~XjbRaeHxaCw_Rf`ErzBj{C}fEf{Ed`B~gEm_HxpAvtEvqBkeRp|Caj@os@m_HxxWulNnpClzD`i@g~JfxA`fBzjHu}L`oHun\\rqAhfBlmEipKd`Gn~A~cBudEnpBjxDrdA{`ExsLqAhrG{cKzi_@{yM~ySlmGtnGcrHr}@prB~~CisBfnMtyM|eG}zBveLraQrhN}mEjkQhpIlbKvUbuX{gH`kBdjD``L{l@p~@e`GnvY_~Bl_GtvOvuD_iL|wKbPj`FujEvh@ajDgqN{vP`uE{sUtiDf@yyAinQi|LhtCsv@uiIatOhpDgoAryEonJsrFpo@yoLwbGzp@ex@q`XilFdlAeyA}jPwyQjdEqdGkhColEoqf@w}G}dDktGhwIa{RaxUunKtlUsdJi_IupZdeMm[knQgfDxrGycDkqb@qtDdIkuAimMhfMcxBlgCb}EvdHqhDh|DfyFj~@esEopFehO{wHzdBwtFwnGtlNswGydCbz@edI{`KnhFopIlnEro@rgAq}LpgKsgF_o@ivMmqMjrBbEsoMklFqh@raNq~Nf~@|nBxnE}wOokHgkH`}C{z]unFm~KoqDbqZshLx~EteB|tH}iIn}Jkt@soLorEjw@iy@ygEavHdkCwsSovDecIjyFc`AwoGybBh_AhiAdkKqzKrbCr{CzgYa{LtcEhnAjuLm~Etr@eQ~`Oga@{nF{fNyh@kRwbDmmInaBlmC~cOm}Ip|EoYisOuqUxlDod@cbHwaU|xChzA`{OjwH`KxtAtmJ_s@hrDqnNvn@ly@jlImkNh{BxrEzkMsbHvGteFb`ImfG|Hzp@zeEcuIugEjm@hmFejHdwEslBefLmxLcsHx@pxCcbGwfCu{EdfD_pOq_MycBtdNuhLufOjUxxNyjTf}C|aAdbOxsFpvBq{E~{T`vBl~Ee}FdlHmhAmvC}jCfeKeuPmItDh}\\khJfqTzdE`pMhmAwpBluBlxDlgIax@um@niFclHpcGkwHsj@ngEr|Vq|Hw|IisIfk@`~Fbr[seIj~D~mCt`P_sO`{Bov@ztUicVny_@x\\~zZ}wBdfIg|Dq`@vgGxfXfyFx_C_wE`yWhaMlpEupCviQraBbiLkzIbuF~z@vvLfoHuhExhBb`IeWblKkbJf}Jdt@`l[liJqwF|x@_qJl{F_Iqv@|jP}dH~fGrkEyGrjI`pN"],
    simplified: ["mpseHqomaDbj[{uqA`dzAsxp@rte@}du@tsYyt@lfcAuscBhofA_p]t~tB`t_@hyeAwjPl_GtvO`pXqcRqaD{d_Awhm@a\\{rQg~r@i_Z~z@olEoqf@eod@uePunKtlU_zk@utDwoLoup@dqb@o]c_XarTxk\\mfp@uhVc}YtpVqg\\c}Jqft@k_Yjew@ebIa`Q}sl@k@_rWlhoA}jZ}yIlmC~cOm}Ip|EoYisO}yl@rc@nhNxu[qt]vkTu}@pf^}qQx|FafPizU_n^qfGycBtdNuhLufOmtS`wSfqEdvo@wh_@ppOubJpor@jcTdiUodR|wEngEr|V{pSopHlfAdsr@_sO`{Bes`@~p{AhlVbs{@wyFrqlBx_TqsRo|I|rXfwOfgN"]
  }
} as const;

function decode(encoded: string): [number, number][] {
  let index=0, lat=0, lon=0;
  const coords: [number,number][]=[];
  while(index < encoded.length){
    const values:number[]=[];
    for(let k=0;k<2;k++){
      let result=0,shift=0,byte=0;
      do { byte=encoded.charCodeAt(index++)-63; result|=(byte&0x1f)<<shift; shift+=5; }
      while(byte>=0x20 && index<=encoded.length);
      values.push(result&1 ? ~(result>>1) : (result>>1));
    }
    lat+=values[0]; lon+=values[1];
    coords.push([lon/1e5,lat/1e5]);
  }
  return coords;
}
export type CountryId = 'ro'|'md';
export type DisplayDetail = 'detailed'|'simplified';
export function getCountryGeoJSON(detail:DisplayDetail): GeoJSON.FeatureCollection {
  return {type:'FeatureCollection',features: (['ro','md'] as CountryId[]).map(id=>({
    type:'Feature',
    id,
    properties:{id,osmRelationId:id==='ro'?90689:58974,admin_level:2,name:id==='ro'?'Romania':'Moldova',boundary:'administrative'},
    geometry:{type:'Polygon',coordinates:outlines[id][detail].map(decode)}
  }))};
}
