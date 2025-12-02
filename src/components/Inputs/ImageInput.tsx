import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FieldError } from "react-hook-form";
import { FiX } from "react-icons/fi";

interface IImageInputProps {
  error?: FieldError;
  title?: string;
  titleClass?: string;
  subtitle?: string;
  subtitleClass?: string;
  caption?: string;
  captionClass?: string;
  imageClass?: string;
  name: string;
  existingImageUrl: string[];
  register: any;
  setValue: any;
  watch?: any;
  multiple?: boolean;
  required?: boolean;
  resubmit?: boolean;
  children?: React.ReactNode;
}

const ImageInput: React.FC<IImageInputProps> = ({
  error,
  title,
  titleClass,
  subtitle,
  subtitleClass,
  caption,
  captionClass,
  imageClass,
  name,
  existingImageUrl,
  register,
  watch,
  setValue,
  children,
  multiple = false,
  required = false,
  resubmit = false,
}) => {
  const [imagePreview, setImagePreview] = useState<any[]>([]);

  useEffect(() => {
    if (existingImageUrl) {
      if (resubmit) {
        register({ name }, { required });
      } else {
        setImagePreview(existingImageUrl);
        register({ name });
      }
    } else {
      register({ name }, { required });
    }
  }, []);

  const onDrop = useCallback((acceptedFiles: any) => {
    if (multiple) {
      if ((watch(name)?.length || 0) + acceptedFiles.length > 3) {
        alert(
          "No more than 3 screenshots can be uploaded, please remove the other selected files first.",
        );
        return;
      }

      if (watch(name)) {
        setValue(name, [...watch(name), ...acceptedFiles], {
          shouldValidate: true,
        });
      } else {
        setValue(name, acceptedFiles, { shouldValidate: true });
      }

      acceptedFiles.forEach((file: any) => {
        const reader = new FileReader();
        reader.onload = () =>
          setImagePreview((prevData) => [...prevData, reader.result]);
        reader.readAsDataURL(file);
      });
    } else {
      const file = acceptedFiles[0];
      if (file) {
        setValue(name, file, { shouldValidate: true });
        const reader = new FileReader();
        reader.onload = () => setImagePreview([reader.result]);
        reader.readAsDataURL(file);
      }
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple,
  });

  const removeFile = (index: any) => {
    const files = watch(name);
    files.splice(index, 1);
    setValue(name, files);

    setImagePreview((prevData) => {
      prevData.splice(index, 1);
      return prevData;
    });
  };

  return (
    <div className="flex flex-col items-center">
      {title && (
        <label
          htmlFor="screenshot"
          className={
            titleClass || "mb-2 block w-full text-sm font-medium leading-5"
          }
        >
          {title}
        </label>
      )}

      {subtitle && (
        <p
          className={
            subtitleClass || "mb-4 w-full text-sm leading-3 text-gray-400"
          }
        >
          {subtitle}
        </p>
      )}

      <div
        {...getRootProps()}
        className="relative w-full cursor-pointer pb-2 focus:outline-none"
      >
        <input {...getInputProps()} accept=".png, .jpg, .jpeg" />

        {imagePreview.length > 0 ? (
          <>
            {multiple ? (
              <div className="flex">
                {imagePreview.map((preview, index) => (
                  <div key={index} className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="closeBtn"
                    >
                      <FiX size={15} color="white" />
                    </button>
                    <img
                      src={preview}
                      alt="image-preview"
                      className="mr-2 rounded"
                      style={{ height: 100 }}
                    />
                  </div>
                ))}
                <div
                  className="flex items-center justify-center rounded border border-dashed border-primary text-lg font-bold text-primary"
                  style={{ width: 100, height: 100 }}
                >
                  +
                </div>
              </div>
            ) : (
              <img
                src={imagePreview[0]}
                alt="image-preview"
                className={imageClass || "mx-auto rounded-lg"}
              />
            )}
          </>
        ) : (
          children
        )}

        {error && (
          <p className="absolute bottom-0 left-0 right-0 text-center text-xs text-red-500">
            {error.message}
          </p>
        )}
      </div>

      {caption && (
        <p
          className={
            captionClass || "mb-4 mt-1 text-center text-xs text-gray-400"
          }
        >
          {caption}
        </p>
      )}
    </div>
  );
};

export default ImageInput;
