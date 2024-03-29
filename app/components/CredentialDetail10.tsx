import React, { CSSProperties } from "react";
import { View, Image, ImageBackground, Text, FlatList } from "react-native";
import { useBranding } from "../contexts/Branding";
import { textColorForBackground } from "@hyperledger/aries-oca";
import { OverlayBundle } from "@hyperledger/aries-oca";
import { CredentialExchangeRecord } from "@aries-framework/core";
import { useMemo, useState } from "react";
import {
  CredentialFormatter,
  DisplayAttribute,
  LocalizedCredential,
} from "@hyperledger/aries-oca";
import AttributeValue from "./AttributeValue";
import AttributeLabel from "./AttributeLabel";

const width = 360;
const paddingHorizontal = 24;
const paddingVertical = 16;
const logoHeight = 80;

function computedStyles(): Record<
  string,
  CSSProperties | Record<string, number>
> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const branding = useBranding();

  return {
    container: {
      backgroundColor: branding?.primaryBackgroundColor,
      display: "flex",
    },
    primaryBodyContainer: {
      paddingHorizontal,
      paddingVertical,
    },
    secondaryBodyContainer: {
      height: 1.5 * logoHeight,
      backgroundColor:
        (branding?.backgroundImage
          ? "rgba(0, 0, 0, 0)"
          : branding?.secondaryBackgroundColor) || "rgba(0, 0, 0, 0.24)",
    },
    logoContainer: {
      top: -0.5 * logoHeight,
      left: paddingHorizontal,
      marginBottom: -1 * logoHeight,
      width: logoHeight,
      height: logoHeight,
      backgroundColor: "#ffffff",
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    textContainer: {
      color: textColorForBackground(
        branding?.primaryBackgroundColor || "#313132"
      ),
      flexShrink: 1,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
    },
    label: {
      fontSize: 14,
      fontWeight: "bold",
    },
    labelSubtitle: {
      fontSize: 14,
      fontWeight: "normal",
    },
    normal: {
      fontSize: 18,
      fontWeight: "normal",
    },
    listText: {
      color: "#313132",
    },
    listBorder: {
      borderColor: "#F2F2F2",
      borderBottomWidth: 2,
      paddingTop: 12,
    },
  };
}

function DetailLogo({
  credential,
  styles,
}: {
  credential?: LocalizedCredential;
  styles?: Record<string, CSSProperties>;
}) {
  const branding = useBranding();

  return (
    <View style={styles?.logoContainer}>
      {branding?.logo ? (
        <Image
          source={branding?.logo}
          alt="Logo"
          style={{
            resizeMode: "cover",
            width: logoHeight,
            height: logoHeight,
            borderRadius: 8,
          }}
        />
      ) : (
        <Text style={[styles?.title, { fontSize: 0.5 * logoHeight }]}>
          {(credential?.issuer ?? credential?.name ?? "C")
            ?.charAt(0)
            .toUpperCase()}
        </Text>
      )}
    </View>
  );
}

function DetailSecondaryBody({
  styles,
}: {
  overlay?: OverlayBundle | undefined;
  styles?: Record<string, CSSProperties>;
}) {
  const branding = useBranding();

  return (
    <View>
      {branding?.backgroundImage ? (
        <ImageBackground
          source={branding?.backgroundImage}
          imageStyle={{
            resizeMode: "cover",
          }}
          alt="Background"
        >
          <View style={styles?.secondaryBodyContainer} />
        </ImageBackground>
      ) : (
        <View style={styles?.secondaryBodyContainer} />
      )}
    </View>
  );
}

function DetailPrimaryBody({
  credential,
  styles,
}: {
  credential?: LocalizedCredential;
  styles?: Record<string, CSSProperties>;
}) {
  return (
    <View style={styles?.primaryBodyContainer}>
      <View>
        <Text
          style={[
            styles?.label,
            styles?.textContainer,
            {
              paddingLeft: logoHeight + paddingVertical,
              paddingBottom: paddingVertical,
              lineHeight: 19,
              opacity: 0.8,
            },
          ]}
          numberOfLines={1}
        >
          {credential?.issuer}
        </Text>
        <Text
          style={[
            styles?.normal,
            styles?.textContainer,
            {
              lineHeight: 24,
            },
          ]}
        >
          {credential?.name}
        </Text>
      </View>
    </View>
  );
}

function Detail({
  credential,
  styles,
  overlay,
  language
}: {
  credential?: LocalizedCredential;
  styles?: Record<string, CSSProperties>;
  overlay?: OverlayBundle;
  language?: string;
}) {
  return (
    <View>
      <View style={styles?.container}>
        <DetailSecondaryBody styles={styles} />
        <DetailLogo credential={credential} styles={styles} />
        <DetailPrimaryBody credential={credential} styles={styles} />
      </View>
      <View>
        <DetailList credential={credential} styles={styles} overlay={overlay} language={language} />
      </View>
    </View>
  );
}

function DetailList({
  credential,
  styles,
  overlay,
  language
}: {
  credential?: LocalizedCredential;
  styles?: Record<string, CSSProperties>;
  overlay?: OverlayBundle;
  language?: string;
}) {
  return (
    <FlatList
      data={credential?.attributes ?? []}
      renderItem={({ item: attribute }: { item: DisplayAttribute }) => {
        const overlayAttribute = getOverlayAttribute(attribute.name, overlay, credential, language) ?? attribute;
        return (
          <View
            style={{
              paddingHorizontal,
              paddingTop: paddingVertical,
            }}
          >
            <AttributeLabel
              attribute={overlayAttribute}
              styles={[
                styles?.normal ?? {},
                styles?.listText ?? {},
                { fontWeight: "bold" },
              ]}
            />
            <AttributeValue
              attribute={overlayAttribute}
              styles={[
                styles?.normal ?? {},
                styles?.listText ?? {},
                { paddingVertical: 4 } as CSSProperties,
              ]}
              size={logoHeight}
            />
            <View style={styles?.listBorder} />
          </View>
        );
      }}
    />
  );
}

function CredentialDetail10({
  overlay,
  record,
  language,
}: {
  overlay?: OverlayBundle;
  record?: CredentialExchangeRecord;
  language: string;
}) {
  const styles = computedStyles();

  const [formatter, setFormatter] = useState<CredentialFormatter | undefined>();

  useMemo(() => {
    if (!(overlay && record)) {
      return;
    }
    setFormatter(new CredentialFormatter(overlay, record));
  }, [overlay, record]);

  const localizedCredential = formatter?.localizedCredential(language ?? "en");

  return (
    <View style={{ width }}>
      <Detail credential={localizedCredential} styles={styles} overlay={overlay} language={language} />
    </View>
  );
}

function getOverlayAttribute(
  name: string,
  overlay: OverlayBundle | undefined,
  credential: LocalizedCredential | undefined,
  language: string | undefined
): DisplayAttribute | undefined {
  const attribute = credential?.getAttribute(name);
  const overlayOptions = overlay?.getAttribute(name);

  if (overlayOptions) {
    const name = attribute?.name ?? "";
    const mimeType = attribute?.mimeType ?? "";
    const value = attribute?.value ?? "";
    return new DisplayAttribute(
      { name, mimeType, value },
      overlayOptions,
      language ?? "en"
    );
  }

  return;
}

export default CredentialDetail10;
