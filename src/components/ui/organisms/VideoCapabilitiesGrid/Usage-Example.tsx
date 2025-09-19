import VideoCapabilitiesGrid from "./VideoCapabilitiesGrid";
import type { Capability } from "./VideoCapabilitiesGrid.types";

const caps: Capability[] = [
  { id:"pre1", title:"Scriptwriting", category:"pre", icon:"📝", tags:["story"], level:"advanced" },
  { id:"prod1", title:"4K Multi‑Cam", category:"production", icon:"🎥", tags:["4k","multi-cam"], featured:true },
  { id:"post1", title:"Color Grading", category:"post", icon:"🎛️", tags:["grading","DaVinci"], level:"pro" },
  { id:"dist1", title:"YouTube Optimization", category:"distribution", icon:"📈", tags:["seo","upload"] },
];

export default function Example() {
  return (
    <VideoCapabilitiesGrid
      title="Production Capabilities"
      subtitle="From storyboard to social cut‑downs."
      capabilities={caps}
      enableFiltering
      enableSearch
      defaultCategory="production"
    />
  );
}