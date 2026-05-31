import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { CrewMember } from "@/core/domain/movie";
import { LOCALIZATION } from "@/core/constants/localization";

interface CrewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  editingCrew: CrewMember | null;
  crewNameInput: string;
  setCrewNameInput: (val: string) => void;
  crewPhotoName: string | null;
  setCrewPhotoName: (val: string | null) => void;
  crewPhotoPreview: string | null;
  setCrewPhotoPreview: (val: string | null) => void;
  setCrewPhotoInput: (val: File | null) => void;
  rawCrewFile: File | null;
  setRawCrewFile: (val: File | null) => void;
  setCropImageSrc: (val: string | null) => void;
  setIsCropModalOpen: (val: boolean) => void;
}

export const CrewFormModal: React.FC<CrewFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingCrew,
  crewNameInput,
  setCrewNameInput,
  crewPhotoName,
  setCrewPhotoName,
  crewPhotoPreview,
  setCrewPhotoPreview,
  setCrewPhotoInput,
  rawCrewFile,
  setRawCrewFile,
  setCropImageSrc,
  setIsCropModalOpen,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-zinc-800/60 p-6 md:p-8 rounded-2xl max-w-md w-full space-y-6 shadow-2xl relative animate-scale-up">
        <Button
          variant="ghost"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-800/60 text-zinc-405 hover:text-white border-0 h-auto"
        >
          <CloseIcon />
        </Button>

        <div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
            {editingCrew
              ? LOCALIZATION.CREW_FORM.EDIT_TITLE
              : LOCALIZATION.CREW_FORM.ADD_TITLE}
          </h3>
          <p className="text-xs text-zinc-400 mt-1 font-light">
            {LOCALIZATION.CREW_FORM.SUBTITLE}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label={LOCALIZATION.CREW_FORM.NAME_LABEL}
            placeholder={LOCALIZATION.CREW_FORM.NAME_PLACEHOLDER}
            value={crewNameInput}
            onChange={(e) => setCrewNameInput(e.target.value)}
            required
            className="bg-black/40 border-zinc-800 focus:border-brand rounded-xl px-4"
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              {LOCALIZATION.CREW_FORM.PHOTO_LABEL}
            </label>
            <div className="relative group/file">
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  if (file) {
                    setRawCrewFile(file);
                    setCropImageSrc(URL.createObjectURL(file));
                    setIsCropModalOpen(true);
                    e.target.value = "";
                  }
                }}
              />
              <div className="w-full bg-black/40 border border-zinc-800 group-hover/file:border-brand rounded-xl px-4 py-3 text-sm text-zinc-405 flex items-center justify-between transition-colors">
                <span
                  className={
                    crewPhotoName
                      ? "text-white font-medium truncate max-w-[70%]"
                      : "text-zinc-400"
                  }
                >
                  {crewPhotoName || LOCALIZATION.CREW_FORM.PHOTO_PLACEHOLDER}
                </span>
                <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-lg text-xs font-semibold group-hover/file:bg-brand group-hover/file:text-white transition-colors">
                  {LOCALIZATION.CREW_FORM.BROWSE}
                </span>
              </div>
            </div>
            {crewPhotoPreview && (
              <div className="flex items-center gap-3 mt-3 pl-1">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border border-zinc-800 bg-black/40 shadow-inner group/crewpreview">
                  <img
                    src={crewPhotoPreview}
                    alt="Crew Preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setCrewPhotoInput(null);
                      setCrewPhotoName(null);
                      setCrewPhotoPreview(
                        editingCrew ? editingCrew.photoUrl || null : null
                      );
                    }}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover/crewpreview:opacity-100 transition-opacity flex items-center justify-center text-red-500 cursor-pointer border-0 h-auto rounded-none p-0"
                  >
                    <CloseIcon className="text-sm text-white" />
                  </Button>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-zinc-300 font-semibold">
                    {LOCALIZATION.CREW_FORM.PREVIEW_TITLE}
                  </span>
                  <span className="text-[10px] text-zinc-500 leading-relaxed">
                    {crewPhotoName
                      ? LOCALIZATION.CREW_FORM.PREVIEW_CROPPED
                      : LOCALIZATION.CREW_FORM.PREVIEW_ORIGINAL}
                  </span>
                  {crewPhotoName && rawCrewFile && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setCropImageSrc(URL.createObjectURL(rawCrewFile));
                        setIsCropModalOpen(true);
                      }}
                      className="text-[10px] text-brand hover:underline font-semibold w-fit text-left mt-1 cursor-pointer border-0 bg-transparent p-0 h-auto hover:bg-transparent"
                    >
                      {LOCALIZATION.CREW_FORM.RECROP}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-zinc-800/40 flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-semibold rounded-xl"
            >
              {LOCALIZATION.CREW_FORM.CANCEL}
            </Button>
            <Button
              type="submit"
              className="flex-1 py-2.5 text-xs font-semibold rounded-xl"
            >
              {editingCrew
                ? LOCALIZATION.CREW_FORM.SAVE
                : LOCALIZATION.CREW_FORM.ADD}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
