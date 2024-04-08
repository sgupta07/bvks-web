import { environment } from "src/environments/environment";
import { ILecture } from "../models/lecture";
import { IPlayerSource } from "../models/player";

export const generateMultiPlaylist = (lecturesArr: ILecture[]) => {
  const sources: IPlayerSource[] = [];
  const data: ILecture[] = JSON.parse(JSON.stringify(lecturesArr));

  data.forEach((lecture) => {
    if (lecture.resources.videos.length) {
      sources.push(generateVideoSource(lecture));
      return;
    }
    if (lecture.resources.audios.length) {
      sources.push(generateAudioSource(lecture));
    }
  });

  return sources;
};

export const generateAudioPlaylist = (lecturesArr: ILecture[]) => {
  const sources: IPlayerSource[] = [];
  const data: ILecture[] = JSON.parse(JSON.stringify(lecturesArr));

  data.forEach((lecture) => {
    sources.push(generateAudioSource(lecture));
  });

  return sources;
};

function generateAudioSource(lecture: ILecture): IPlayerSource {
  const name = lecture.title.join(" ");
  const poster: string = lecture.thumbnail.length
    ? lecture.thumbnail
    : environment.lectionThumbnailPlaceholder;

  return {
    name,
    sources: [
      {
        type: "audio/mp3",
        src: lecture.resources.audios[0].url,
      },
    ],
    poster,
    thumbnail: [
      {
        src: poster,
      },
    ],
    lectureData: lecture,
  };
}

function generateVideoSource(lecture: ILecture): IPlayerSource {
  const name = lecture.title.join(" ");
  const type = detectVideoType(lecture.resources.videos[0].type);
  const poster = lecture.thumbnail.length
    ? lecture.thumbnail
    : environment.lectionThumbnailPlaceholder;

  return {
    name,
    sources: [
      {
        type,
        src: lecture.resources.videos[0].url,
      },
    ],
    youtube: { autoplay: 1 },
    poster,
    thumbnail: [
      {
        src: poster,
      },
    ],
    lectureData: lecture,
  };
}

function detectVideoType(type: string): string {
  if (type === "youtube") {
    return "video/youtube";
  }
  return "video/mp4";
}
