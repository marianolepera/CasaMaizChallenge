import {useAppUpdate} from '../../cms/AppUpdateProvider';
import {getOperationalNoticeMessage} from '../../cms/bootstrap';
import {useBootstrap} from '../../cms/CmsBootstrapProvider';
import {usePageAlert} from '../../cms/CmsAlertProvider';
import {handleResolvedDestination} from '../../navigation/destinations';
import {AppUpdateNotice} from './AppUpdateNotice';
import {CmsAlertBanner} from './CmsAlertBanner';
import {OperationalNotice} from './OperationalNotice';

export function CmsScreenBanners({pageSlug}: {pageSlug: string}) {
  const notice = getOperationalNoticeMessage(
    useBootstrap()?.operationalControls,
  );
  const {recommendedMessage, onDismissRecommended} = useAppUpdate();
  const {alert, onDismiss} = usePageAlert(pageSlug);
  const recommendedBanner =
    recommendedMessage && onDismissRecommended ? (
      <AppUpdateNotice
        message={recommendedMessage}
        onDismiss={onDismissRecommended}
      />
    ) : null;
  const alertBanner = alert ? (
    <CmsAlertBanner
      title={alert.title}
      message={alert.message}
      actions={alert.actions.map(action => ({label: action.label}))}
      onAction={index => {
        const destination = alert.actions[index]?.destination;
        if (destination) {
          handleResolvedDestination(destination);
        }
      }}
      onDismiss={onDismiss}
    />
  ) : null;

  return (
    <>
      {alertBanner}
      {recommendedBanner}
      {notice ? <OperationalNotice message={notice} /> : null}
    </>
  );
}
