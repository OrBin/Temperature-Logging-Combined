import { TemperatureLoggingPage } from './app.po';

describe('temperature-logging App', () => {
  let page: TemperatureLoggingPage;

  beforeEach(() => {
    page = new TemperatureLoggingPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
