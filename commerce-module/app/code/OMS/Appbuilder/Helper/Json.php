<?php
 /**
 * IBM_Customer module
 *
 * @copyright Copyright (c) 2022 IBM Inc.
 */
namespace OMS\Appbuilder\Helper;
use stdClass;

class Json
{
    public string $grant_type;
    public $client_id;
    public $client_secret;
    public $scope;
    
    public function __construct(
    ) {
        return new stdClass();
    }

}
