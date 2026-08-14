import { Heading, Text, VStack } from "../../../ui/primitives";
import { Progress, Skeleton } from "../../../ui/primitives";
import { localeMap, localeToCountry } from "./map";
import "./DetailStatistic.css";

const DetailStatisticTable = ({
  data,
  title = "",
  total = "",
  subTitle = "",
  keyHead = "",
  valHead = "",
  isLoading = false,
}) => {
  const countries = {
    "United States": 21,
    India: 9,
    Canada: 3,
    Egypt: 2,
    Germany: 2,
  };
  if (!data) {
    data = countries;
  }

  if (isLoading) {
    return (
      <div className="detail-stat detail-stat--loading">
        <Skeleton height="24px" width="70%" mb={2} />
        <div className="detail-stat__row">
          <Skeleton height="20px" width="50%" mb={4} />
          <Skeleton height="20px" width="30%" mb={4} />
        </div>

        <VStack spacing={2} align="stretch">
          {[1, 2, 3, 4].map((item) => (
            <div key={item}>
              <div className="detail-stat__row detail-stat__row--mb">
                <Skeleton height="16px" width="40%" />
                <Skeleton height="16px" width="15%" />
              </div>
              <Skeleton height="8px" width="100%" />
            </div>
          ))}
        </VStack>
      </div>
    );
  }

  const sumValue: any = Object.values(data).reduce(
    (accumulator: any, currentValue: any) => accumulator + currentValue,
    0
  );

  return (
    <div className="detail-stat">
      <Heading size="md" mb={1}>
        {title}
      </Heading>
      {total && (
        <Text fontSize="xl" fontWeight="bold">
          {total}
        </Text>
      )}
      <Text fontSize="lg" fontWeight="semibold">
        {subTitle}
      </Text>
      <VStack spacing={2} align="stretch">
        <div className="detail-stat__row">
          <Text fontSize="medium" fontWeight="semibold">
            {keyHead}
          </Text>
          <Text fontSize="medium" fontWeight="semibold">
            {valHead}
          </Text>
        </div>
        {Object.keys(data).map((key) => (
          <div key={key}>
            <div className="detail-stat__row">
              <Text fontWeight="semibold">
                {key in localeMap ? localeToCountry(key) : key}
              </Text>
              <Text>{data[key]}</Text>
            </div>
            <Progress
              value={Math.floor((data[key] / sumValue) * 100) ?? 0}
              size="sm"
              colorScheme="blue"
              mt={1}
            />
          </div>
        ))}
      </VStack>
    </div>
  );
};

export default DetailStatisticTable;
