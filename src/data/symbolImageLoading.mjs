/** Loading permission is independent of exact-ID symbol selection and heraldic verdicts.
 * Tree miniatures must not initiate full remote originals before explicit selection.
 * Previously decoded card images may be reused; no URL rewriting or new derivative. */
export function mayRequestSymbolImage({src,tree=false,selected=false,decodedSources=new Set()}){
 if(!src)return false;
 return !tree||selected||!/^https?:\/\//i.test(src)||decodedSources.has(src);
}
