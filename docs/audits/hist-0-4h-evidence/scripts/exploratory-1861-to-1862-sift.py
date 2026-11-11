import os,cv2,json,hashlib,numpy as np
from pathlib import Path
root=Path(os.environ['USERPROFILE'])/'Documents'/'Atlas-OHM-Inventory-2026-11-10'
src=root/'hist-0-4g-research-local'
ref=root/'hist-0-4e-drive-evidence'/'eharta-Siebenburgen-1862-thumbnail.jpg'
names=json.loads((src/'acquisition-manifest-local.json').read_text(encoding='utf8'))['scans']
if not ref.exists():raise SystemExit('REFERENCE_THUMBNAIL_MISSING')
refim=cv2.imread(str(ref),cv2.IMREAD_GRAYSCALE)
print('REF',refim.shape,flush=True)
sift=cv2.SIFT_create(nfeatures=1800,contrastThreshold=0.024,edgeThreshold=12)
refkp,refdesc=sift.detectAndCompute(refim,None)
bf=cv2.BFMatcher(cv2.NORM_L2)
records=[]
for i,entry in enumerate(names):
 p=src/entry['local_file']
 # img loaded, resized to max 1000 px (maintain original aspect and feature geometry only)
 im=cv2.imread(str(p),cv2.IMREAD_GRAYSCALE)
 if im is None:raise RuntimeError('BAD_'+str(p))
 scale=1100/max(im.shape)
 im=cv2.resize(im,None,fx=scale,fy=scale,interpolation=cv2.INTER_AREA)
 kp,des=sift.detectAndCompute(im,None)
 matches=bf.knnMatch(des,refdesc,k=2) if des is not None and refdesc is not None else []
 good=[m for m,n in matches if m.distance<0.72*n.distance]
 candidate={'image_index':i+1,'image_sha256':entry['sha256'],'size_photo_px':[entry['width'],entry['height']],'working_size_px':[im.shape[1],im.shape[0]],'features':len(kp),'matches_0_72_ratio':len(good),'ref_features':len(refkp),'reference_is_historical_1862_not_independent_modern_ground_control':True}
 if len(good)>=4:
  srcpts=np.float32([kp[m.queryIdx].pt for m in good]).reshape(-1,1,2)
  dstpts=np.float32([refkp[m.trainIdx].pt for m in good]).reshape(-1,1,2)
  h,mask=cv2.findHomography(srcpts,dstpts,cv2.RANSAC,5.0,maxIters=4000,confidence=0.995)
  if h is not None and mask is not None:
   inliers=mask.ravel().astype(bool); n=int(inliers.sum()); candidate['ransac_inliers']=n
   candidate['ransac_inlier_fraction']=round(n/len(good),5)
   if n>0:
    projected=cv2.perspectiveTransform(srcpts[inliers],h)
    err=np.linalg.norm(projected.reshape(-1,2)-dstpts[inliers].reshape(-1,2),axis=1)
    candidate['inlier_fit_rmse_reference_thumbnail_pixels']=float(np.sqrt(np.mean(err**2)))
    candidate['inlier_fit_p95_reference_thumbnail_pixels']=float(np.percentile(err,95))
    spread=np.ptp(srcpts[inliers].reshape(-1,2),axis=0)
    candidate['inlier_spread_fraction_photo_thumbnail']=[round(float(spread[0]/im.shape[1]),4),round(float(spread[1]/im.shape[0]),4)]
    refpts=dstpts[inliers].reshape(-1,2)
    unique_reference_features=len(np.unique(refpts,axis=0))
    reference_hull_area_px2=float(cv2.contourArea(cv2.convexHull(refpts))) if unique_reference_features>=3 else 0.0
    candidate['distinct_reference_features']=unique_reference_features
    candidate['reference_hull_area_fraction']=round(reference_hull_area_px2/(refim.shape[0]*refim.shape[1]),7)
    candidate['initial_geometric_coverage_screen_pass']=bool(n>=15 and min(spread[0]/im.shape[1],spread[1]/im.shape[0])>=0.2)
    candidate['degeneracy_aware_screen_pass']=bool(candidate['initial_geometric_coverage_screen_pass'] and unique_reference_features>=15 and candidate['reference_hull_area_fraction']>=0.01)
 else:candidate['ransac_inliers']=0
 candidate['independent_gcp_count']=0;candidate['georeferencing_admitted']=False
 records.append(candidate)
 print('IMAGE',i+1,'MATCH',candidate['matches_0_72_ratio'],'INLIERS',candidate.get('ransac_inliers',0),'SPREAD',candidate.get('inlier_spread_fraction_photo_thumbnail'),flush=True)
out={'phase':'HIST-0.4h','date':'2026-11-11','operation':'EXPLORATORY_NONINDEPENDENT_IMAGE_FEATURE_REGISTRATION','reference':'eHarta 1862 thumbnail derived from 1862 GeoTIFF; potential cartographic lineage not independent','method':'OpenCV SIFT feature matching ratio=0.72 and homography RANSAC=5.0 reference-thumb pixels','reference_thumbnail_dimensions':list(refim.shape[::-1]),'reference_sha256':hashlib.sha256(ref.read_bytes()).hexdigest(),'entries':records,'qualified_independent_GCPs':0,'qualified_georeferences':0,'degeneracy_screen_pass_count':sum(1 for x in records if x.get('degeneracy_aware_screen_pass')), 'reason':'Automated graphic similarity lacks independently identified and field-verified stable geographic control points, date/edition and residual analysis.'}
dest=root/'hist-0-4h-research-local'/'1861-photo-exploratory-match-local.json'
dest.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('RESULT',str(dest),flush=True)
