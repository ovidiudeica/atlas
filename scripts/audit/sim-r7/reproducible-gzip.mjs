import {gzipSync} from 'node:zlib';
// RFC1952 OS=255 means unknown: identical payloads must not encode the build host.
// Node emits zero MTIME and no optional gzip header fields by default.
export function reproducibleGzip(input){
 const bytes=gzipSync(input,{level:9});
 bytes[9]=255;
 return bytes;
}
